export default {
  tallenna: async function () {
    try {
      const tyyppi = tTyyppi.selectedOptionValue;
      const kilpi = tyyppi === 'kilpitilaus';
      const tarjous = tyyppi === 'tarjouspyynto';
      const rivit = appsmith.store.tiskiRivit || [];
      if (kilpi && !rivit.length) { showAlert('Lisää ainakin yksi kilpi listalle', 'warning'); return; }
      if (kilpi && !tAihe.text) { await tAihe.setValue('Postilaatikkokilvet · ' + (rivit[0].kohde_nimi || '')); }
      if (!tAihe.text) { showAlert('Kirjoita aihe', 'warning'); return; }
      const kuvat = appsmith.store.tiskiKuvat || [];
        const liitteet = kuvat;
      const vastaus = tarjous ? await luoTarjousT.run() : await luoTilausT.run();
      const r = Array.isArray(vastaus) ? vastaus[0] : vastaus;
      if (!r || !r.id) { showAlert('Tallennus epäonnistui', 'error'); return; }
      let kilpiaOk = 0;
      if (kilpi) {
        const maksaja = (tMaksaja.text || '').trim() || null;
        const viite = (tLaskutusviite.text || '').trim() || null;
        const toimitus = (tOsoite.text || '').trim() || null;
        const payload = rivit.map(function (x) {
          const p = { teksti: x.teksti, huoneisto: x.huoneisto || null, maksaja: maksaja, laskutusviite: viite, toimitusosoite: toimitus };
          if (x.rekisteri) { p.taloyhtio_id = x.taloyhtio_id; p.kilpi_id = x.kilpi_id; }
          else { p.tilattu_taloyhtio = x.kohde_nimi || null; p.tyyppi = x.tyyppi || null; p.koko = x.koko || null; p.vari = x.vari || null; p.materiaali = x.materiaali || null; p.kiinnitys = x.kiinnitys || null; }
          return p;
        });
        try {
          await lisaaTiskirivitT.run({ tid: r.id, rivit: JSON.stringify(payload) });
          kilpiaOk = payload.length;
        } catch (e) {
          showAlert('Työ tallennettiin (' + r.tp_numero + '), mutta kilpirivien tallennus epäonnistui: ' + e.message, 'error');
        }
      }
      let liitteitaOk = 0;
      if (liitteet.length) {
        try {
          await storeValue('tiskiLiitteet', liitteet);
          await liitaManuaaliT.run({ toimeksianto_id: r.id });
          liitteitaOk = liitteet.length;
        } catch (e) {
          showAlert('Työ tallennettiin (' + r.tp_numero + '), mutta liitteiden tallennus epäonnistui', 'warning');
        }
        await storeValue('tiskiLiitteet', []);
      }
      await storeValue('tiskiValmis', { tp_numero: r.tp_numero, asiakas: (tYritys.text || tNimi.text || ''), liitteita: liitteitaOk, kilpia: kilpiaOk });
      showModal('valmisModal');
    } catch (e) {
      showAlert('Tallennus epäonnistui: ' + e.message, 'error');
    }
  },
  lisaaKilpi: async function () {
    const avain = tKohde.selectedOptionValue;
    const k = (hakuKohteetT.data || []).filter(function (x) { return x.avain === avain; })[0];
    if (!k) { showAlert('Valitse ensin kohde', 'warning'); return; }
    const teksti = (tKilpiTeksti.text || '').trim();
    if (!teksti) { showAlert('Kirjoita nimi kilpeen', 'warning'); return; }
    if (!k.kilpi_id) { showAlert('Kohteella ei ole postilaatikkokilpeä rekisterissä — käytä käsinkirjausta', 'warning'); return; }
    const arr = (appsmith.store.tiskiRivit || []).slice();
    arr.push({ teksti: teksti, huoneisto: (tHuoneisto.text || '').trim(), taloyhtio_id: String(k.taloyhtio_id), kilpi_id: String(k.kilpi_id), kohde_nimi: k.taloyhtio, tyyppi: k.tyyppi, koko: k.koko, vari: k.vari, materiaali: k.materiaali, kiinnitys: k.kiinnitys, rekisteri: true });
    await storeValue('tiskiRivit', arr);
    await Promise.all([resetWidget('tKilpiTeksti'), resetWidget('tHuoneisto')]);
  },
  lisaaKasin: async function () {
    const teksti = (kmTeksti.text || '').trim();
    if (!teksti) { showAlert('Kirjoita nimi kilpeen', 'warning'); return; }
    const valinta = kmTyyppi.selectedOptionValue || '';
    let tyyppi = null;
    let koko = (kmKoko.text || '').trim() || null;
    if (valinta.indexOf('T:') === 0) { tyyppi = valinta.slice(2); }
    else if (valinta.indexOf('K:') === 0 && !koko) { koko = valinta.slice(2); }
    const vari = (kmVari.text || '').trim();
    const materiaali = kmMateriaali.selectedOptionValue;
    if (!vari || !materiaali || (!koko && !tyyppi)) { showAlert('Ilman rekisterikohdetta tarvitaan väri, materiaali sekä koko tai tyyppi', 'warning'); return; }
    const arr = (appsmith.store.tiskiRivit || []).slice();
    arr.push({ teksti: teksti, huoneisto: (kmHuoneisto.text || '').trim(), kohde_nimi: (kmTaloyhtio.text || '').trim(), tyyppi: tyyppi, koko: koko, vari: vari, materiaali: materiaali, kiinnitys: kmKiinnitys.selectedOptionValue || null, rekisteri: false });
    await storeValue('tiskiRivit', arr);
    await Promise.all([resetWidget('kmTeksti'), resetWidget('kmHuoneisto')]);
    closeModal('kasinModal');
  },
  uusi: async function () {
    await storeValue('tiskiKuvat', []);
    await storeValue('tiskiLiitteet', []);
    await storeValue('tiskiRivit', []);
    await storeValue('kohdeHaettu', false);
    await Promise.all([resetWidget('tAihe'), resetWidget('tNimi'), resetWidget('tYritys'), resetWidget('tEmail'), resetWidget('tPuh'), resetWidget('tOsoite'), resetWidget('tKuvaus'), resetWidget('tSisainen'), resetWidget('tPvm'), resetWidget('tHinta'), resetWidget('tViite'), resetWidget('tAsennus'), resetWidget('tAsennusPvm'), resetWidget('tHaku'), resetWidget('tLaskutus'), resetWidget('tTyyppi'), resetWidget('tKohde'), resetWidget('tKilpiTeksti'), resetWidget('tHuoneisto'), resetWidget('tMaksaja'), resetWidget('tLaskutusviite'), resetWidget('tKilpiSisainen')]);
    closeModal('valmisModal');
  }
}