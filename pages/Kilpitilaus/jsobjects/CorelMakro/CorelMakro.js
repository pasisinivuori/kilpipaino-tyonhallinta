export default {
	async lataa (eraId) {
		await storeValue('pdfEraId', eraId);
		const rivit = await hakuEranRivit.run();
		if (!rivit || rivit.length === 0) { showAlert('Eralle ei loytynyt riveja.', 'warning'); return; }
		const pohjaRes = await haeMakropohja.run();
		if (!pohjaRes || pohjaRes.length === 0) { showAlert('Makropohjaa ei loytynyt kannasta.', 'error'); return; }
		const pohja = pohjaRes[0].sisalto;
		const era = rivit[0].eranumero || '';
		const pvm = (rivit[0].eran_pvm || '').slice(0, 10).replace(/\./g, '');
		const moduuli = 'Kilpiera_' + era.replace(/[^0-9A-Za-z]/g, '_');
		const puuttuvat = [];
		const lines = [];
		rivit.forEach(r => {
			const ryhma = (r.materiaali || '?') + ' ' + (r.vari || '?') + ((r.pintakasittely && r.pintakasittely !== '-') ? ' ' + r.pintakasittely : '');
			const tyyppi = (r.tyyppi || '').trim();
			const stala = /stala/i.test(tyyppi);
			let lev = 0, kork = 0;
			const m = (r.koko || '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+(?:\.\d+)?)/);
			if (m) { lev = parseFloat(m[1]); kork = parseFloat(m[2]); }
			if (!stala && !(lev > 0 && kork > 0)) { puuttuvat.push((r.taloyhtio || '?') + ' ' + (r.teksti || '')); return; }
			let nimi = (r.teksti || '').trim();
			const huo = (r.huoneisto || '').trim();
			if (huo && nimi.toUpperCase().indexOf(huo.toUpperCase()) === 0) { nimi = nimi.slice(huo.length).trim(); }
			const kentat = [ryhma, stala ? 'Stala' : '', stala ? 0 : lev, stala ? 0 : kork, huo, nimi]
				.map(v => String(v).replace(/\|/g, ' ').replace(/"/g, '""'));
			lines.push('    R "' + kentat.join('|') + '"');
		});
		if (lines.length === 0) { showAlert('Yhdellekaan riville ei saatu kokoa - makroa ei luotu.', 'error'); return; }
		if (lines.length > 800) { showAlert('Era on liian suuri yhdelle makrolle (' + lines.length + ' kilpea). Jaa era pienempiin.', 'error'); return; }
		const bas = pohja.replace('__MODULE__', moduuli).replace('__DATA__', lines.join('\n'));
		download(this.cp1252(bas), 'Kilpiera_' + era + '_' + pvm + '.bas', 'text/plain');
		let viesti = 'Makro luotu: ' + lines.length + ' kilpea. Tuo se CorelDRAW:n makroeditoriin (Alt+F11, File > Import File) ja aja KilpieraLuo.';
		if (puuttuvat.length) { viesti += ' HUOM: ' + puuttuvat.length + ' rivia jai pois, koska kokoa ei ollut: ' + puuttuvat.slice(0, 3).join('; ') + '.'; }
		showAlert(viesti, puuttuvat.length ? 'warning' : 'success');
	},
	cp1252 (txt) {
		let bin = '';
		for (let i = 0; i < txt.length; i++) {
			const c = txt.charCodeAt(i);
			bin += String.fromCharCode(c < 256 ? c : 63);
		}
		return 'data:text/plain;base' + '64,' + btoa(bin);
	}
}