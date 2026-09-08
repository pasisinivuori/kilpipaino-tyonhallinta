export default {
  tyhjennaLomake () {
    const w = ["Input1","Input2","Input3","Input4","Input5","Select1","Input6",
      "RichTextEditor1","RichTextEditor2","FilePicker1",
      "RichTextEditor3","RichTextEditor4","DatePicker1","Input7","CurrencyInput1",
      "Switch2","DatePicker2","RadioGroup1"];
    w.forEach(n => resetWidget(n, true));
  },
  async tallennaTarjous () {
    const r = await luoTarjous.run();
    const id = (r && r[0] && r[0].id) ? r[0].id : null;
    const tp = (r && r[0] && r[0].tp_numero) ? r[0].tp_numero : "";
    if (id && FilePicker1.files && FilePicker1.files.length > 0) {
      await liitaManuaali.run({ toimeksianto_id: id });
    }
    showAlert("Tarjouspyyntö tallennettu: " + tp, "success");
    this.tyhjennaLomake();
  },
  async lahetaTarjous () {
    if (!Input3.text || Input3.text.trim() === "") {
      showAlert("Lisää asiakkaan sähköpostiosoite ennen lähetystä.", "warning");
      return;
    }
    const r = await luoTarjous.run();
    const id = (r && r[0] && r[0].id) ? r[0].id : null;
    const tp = (r && r[0] && r[0].tp_numero) ? r[0].tp_numero : "";
    if (!id) { showAlert("Tallennus epäonnistui", "error"); return; }
    if (FilePicker1.files && FilePicker1.files.length > 0) {
      await liitaManuaali.run({ toimeksianto_id: id });
    }
    const liitteet = await getLiitteetTarjous.run({ id: id });
    await lahetaTarjousWebhook.run({ tid: id, body: RichTextEditor1.text, liitteet: liitteet || [] });
    showAlert("Tarjous " + tp + " lähetetty (lähtee jos vastuuhenkilö = Pasi).", "success");
    this.tyhjennaLomake();
  },
  async tallennaTilaus () {
    const r = await luoTilaus.run();
    const tp = (r && r[0] && r[0].tp_numero) ? r[0].tp_numero : "";
    showAlert("Tilaus tallennettu: " + tp, "success");
    this.tyhjennaLomake();
  }
}