export default {
	async lataa() {
		// Ajetaan tilastokyselyt kolmen erissa, ei kaikkia 12 yhtaikaa.
		// Supabasen poolerin session-tila sallii rajallisen maaran
		// yhtaikaisia yhteyksia; ryntays kaatoi osan kyselyista
		// virheeseen "max clients reached in session mode".
		const ERAKOKO = 3;
		const kyselyt = [
			() => tilastotStatus.run(),
			() => tilastotVastausaikaKa.run(),
			() => tilastotVastaamatta.run(),
			() => tilastotOdottaaVastausta.run(),
			() => tilastotVastausaikaKk.run(),
			() => tilastotVolyymiKk.run(),
			() => tilastotMyohassa.run(),
			() => tilastotLapimenoaika.run(),
			() => tilastotTunnit.run(),
			() => tilastotVastuuhenkilo.run(),
			() => tilastotAsennukset.run(),
			() => tilastotTopAsiakkaat.run()
		];
		const virheet = [];
		for (let i = 0; i < kyselyt.length; i += ERAKOKO) {
			await Promise.all(
				kyselyt.slice(i, i + ERAKOKO).map(
					(f) => f().catch((e) => { virheet.push(String((e && e.message) ? e.message : e)); })
				)
			);
		}
		if (virheet.length > 0) {
			const yhteysvika = virheet.some((v) => /EMAXCONNSESSION|max clients|too many clients/i.test(v));
			showAlert(
				yhteysvika
					? 'Osa tilastoista jai lataamatta: tietokantayhteydet loppuivat hetkeksi. Paivita sivu.'
					: 'Osa tilastoista jai lataamatta: ' + virheet[0],
				'error'
			);
		}
		return virheet.length === 0;
	}
}