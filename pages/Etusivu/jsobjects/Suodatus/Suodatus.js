export default {
	henkilonRivit: () => {
	// Vain vastuuhenkilörajaus. Kanban käyttää tätä: sen sarakkeet
	// ovat tiloja, joten tilasuodatin ei kuulu siihen.
	const kaikki = SelectQuery.data || [];
	const h = vastuuSelect.selectedOptionValue;
	if (!h || h === 'KAIKKI') { return kaikki; }
	return kaikki.filter(r => r && r.omistaja === h);
},

	rivit: () => {
	// Työlistan rivit: vastuuhenkilö -> tila -> odottaa meiltä -> järjestys
	const kaikki = SelectQuery.data || [];
	const h = vastuuSelect.selectedOptionValue;

	// 1) Vastuuhenkilö on ehdoton rajaus.
	let rivit = (!h || h === 'KAIKKI') ? kaikki : kaikki.filter(r => r && r.omistaja === h);

	// 2) Tilasuodatin. Poikkeus: suljettu työ, johon on tullut uusi viesti,
	//    näkyy aina - muuten viesti jäisi huomaamatta.
	const tilat = MultiSelect1.selectedOptionValues || [];
	if (tilat.length > 0) {
		rivit = rivit.filter(r => r.uusi_viesti_suljettuun || tilat.indexOf(r.status) !== -1);
	}

	// 3) "Näytä vastausta odottavat"
	if (Switch2.isSwitchedOn) {
		rivit = rivit.filter(r => r && r.odottaa_meilta);
	}

	// 4) Järjestys
	const jarj = jarjestysSelect.selectedOptionValue;
	if (jarj === 'kiire') {
		return rivit.slice().sort((a, b) => {
			const ta = (a.kiire_taso == null ? 9 : Number(a.kiire_taso));
			const tb = (b.kiire_taso == null ? 9 : Number(b.kiire_taso));
			if (ta !== tb) { return ta - tb; }
			const oa = Number(a.kiire_odotus || 0), ob = Number(b.kiire_odotus || 0);
			if (oa !== ob) { return ob - oa; }
			return new Date(a.created_at) - new Date(b.created_at);
		});
	}
	const sorted = rivit.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
	const ord = jarj === 'asc' ? sorted : sorted.reverse();

	// 5) Uudet viestit suljettuihin töihin nousevat kärkeen
	return ord.filter(r => r.uusi_viesti_suljettuun).concat(ord.filter(r => !r.uusi_viesti_suljettuun));
}
}