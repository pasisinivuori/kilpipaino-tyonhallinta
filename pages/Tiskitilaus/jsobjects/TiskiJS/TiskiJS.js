export default {
  async tallenna () {
    try {
      const tarjous = tTyyppi.selectedOptionValue !== 'tilaus';
      const kuvat = appsmith.store.tiskiKuvat || [];
      const tiedostot = tLiitteet.files || [];
      const liitteet = kuvat.concat(tiedostot);
      const rivi = tarjous ? await luoTarjousT.run() : await luoTilausT.run();
      const r = Array.isArray(rivi) ? rivi[0] : rivi;
      if (!r || !r.id) { showAlert('Tallennus epäonnistui', 'error'); return; }
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
      await storeValue('tiskiValmis', { tp_numero: r.tp_numero, asiakas: (tYritys.text || tNimi.text || ''), liitteita: liitteitaOk, tarjous: tarjous });
      showModal('valmisModal');
    } catch (e) {
      showAlert('Tallennus epäonnistui: ' + e.message, 'error');
    }
  },
  async uusi () {
    await storeValue('tiskiKuvat', []);
    await storeValue('tiskiLiitteet', []);
    await Promise.all([resetWidget('tAihe'), resetWidget('tNimi'), resetWidget('tYritys'), resetWidget('tEmail'), resetWidget('tPuh'), resetWidget('tOsoite'), resetWidget('tKuvaus'), resetWidget('tSisainen'), resetWidget('tPvm'), resetWidget('tHinta'), resetWidget('tViite'), resetWidget('tAsennus'), resetWidget('tAsennusPvm'), resetWidget('tLiitteet'), resetWidget('tHaku'), resetWidget('tLaskutus'), resetWidget('tTyyppi')]);
    closeModal('valmisModal');
  }
}