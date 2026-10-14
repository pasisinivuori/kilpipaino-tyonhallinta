export default {
  // Hintalaskuri (luonnos): avain appsmith.storessa, rivit kiinnitetään työhön tallennuksessa
  uusiAvain () {
    try { if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  },
  async lataaLaskuri () {
    if (!appsmith.store.laskuriLuonnos) await storeValue('laskuriLuonnos', this.uusiAvain(), true);
    return haeLaskuri.run();
  },
  async uusiLaskuri () {
    await storeValue('laskuriLuonnos', this.uusiAvain(), true);
    return haeLaskuri.run();
  },
  async odotaLaskuri () {
    // laskuri tallentaa muutokset ~1 s viiveellä: odotetaan, että viimeinen muutos on kannassa
    await new Promise(r => setTimeout(r, 1500));
    for (let i = 0; i < 50 && tallennaLaskuri.isLoading; i++) await new Promise(r => setTimeout(r, 200));
  },
  async kiinnitaLaskuri (id) {
    const avain = appsmith.store.laskuriLuonnos;
    if (!id || !avain) return;
    await kiinnitaLaskuri.run({ avain: avain, id: id });
    await this.uusiLaskuri();
  },
  tyhjennaLomake () {
    const w = ["Input1","Input2","Input3","Input4","Input5","Select1","Input6",
      "RichTextEditor1","RichTextEditor2","FilePicker1","FilePicker2",
      "RichTextEditor3","RichTextEditor4","DatePicker1","Input7","CurrencyInput1","laskutusperusteSelect",
      "Switch2","DatePicker2","RadioGroup1"];
    w.forEach(n => resetWidget(n, true));
  },
  async tallennaTarjous () {
    await this.odotaLaskuri();
    const r = await luoTarjous.run();
    const id = (r && r[0] && r[0].id) ? r[0].id : null;
    const tp = (r && r[0] && r[0].tp_numero) ? r[0].tp_numero : "";
    if (id && FilePicker1.files && FilePicker1.files.length > 0) {
      await liitaManuaali.run({ toimeksianto_id: id, files: FilePicker1.files });
    }
    if (id) await this.kiinnitaLaskuri(id);
    showAlert("Tarjouspyyntö tallennettu: " + tp, "success");
    this.tyhjennaLomake();
  },
  async lahetaTarjous () {
    if (!Input3.text || Input3.text.trim() === "") {
      showAlert("Lisää asiakkaan sähköpostiosoite ennen lähetystä.", "warning");
      return;
    }
    await this.odotaLaskuri();
    const r = await luoTarjous.run();
    const id = (r && r[0] && r[0].id) ? r[0].id : null;
    const tp = (r && r[0] && r[0].tp_numero) ? r[0].tp_numero : "";
    if (!id) { showAlert("Tallennus epäonnistui", "error"); return; }
    if (FilePicker1.files && FilePicker1.files.length > 0) {
      await liitaManuaali.run({ toimeksianto_id: id, files: FilePicker1.files });
    }
    await this.kiinnitaLaskuri(id);
    const liitteet = await getLiitteetTarjous.run({ id: id });
    await lahetaTarjousWebhook.run({ tid: id, body: RichTextEditor1.text, liitteet: liitteet || [] });
    showAlert("Tarjous " + tp + " lähetetty.", "success");
    this.tyhjennaLomake();
  },
  async tallennaTilaus () {
    await this.odotaLaskuri();
    const r = await luoTilaus.run();
    const id = (r && r[0] && r[0].id) ? r[0].id : null;
    const tp = (r && r[0] && r[0].tp_numero) ? r[0].tp_numero : "";
    if (id && FilePicker2.files && FilePicker2.files.length > 0) {
      await liitaManuaali.run({ toimeksianto_id: id, files: FilePicker2.files });
    }
    if (id) await this.kiinnitaLaskuri(id);
    showAlert("Tilaus tallennettu: " + tp, "success");
    this.tyhjennaLomake();
  }
}