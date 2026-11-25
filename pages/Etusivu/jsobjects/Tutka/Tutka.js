export default {
	// Työtutka (Etusivun Tutka-näkymä) 25.11.2026. Widget kirjoittaa malliin toiminto-olion ja laukaisee onToiminto-eventin.
	async toiminto () {
		const t = (tutkaWidget.model && tutkaWidget.model.toiminto) || {};
		if (!t.tyyppi || t.k === this.viimeisin) return;
		this.viimeisin = t.k;
		try {
			switch (t.tyyppi) {
				case 'avaa':
					return navigateTo('Työkortti', { id: t.id }, 'SAME_WINDOW');
				case 'luonnostele':
					return navigateTo('Työkortti', { id: t.id, ai: '1' }, 'SAME_WINDOW');
				case 'nakyma':
					return this.nayta(t.n);
				case 'tila':
					return storeValue('tutkaTila', t.tila, false);
				case 'henkilo':
					return storeValue('tutkaHenkilo', t.n || null, true);
				case 'esikatsele': {
					const r = await tutkaEsikatselu.run({ id: t.id, uusi: t.uusi });
					return storeValue('tutkaEsik', Object.assign({}, (r && r[0]) || {}, { id: t.id, uusi: t.uusi, k: Date.now() }), false);
				}
				case 'peruEsik':
					return storeValue('tutkaEsik', null, false);
				case 'vaihdaStatus':
					await tutkaToiminto.run({ tyyppi: 'vaihdaStatus', id: t.id, uusi: t.uusi });
					await storeValue('tutkaEsik', null, false);
					showAlert('Status vaihdettu', 'success');
					break;
				case 'paiva':
					await tutkaToiminto.run({ tyyppi: 'paiva', id: t.id, kentta: t.kentta, pvm: t.pvm });
					break;
				case 'kuittaa':
					await tutkaToiminto.run({ tyyppi: 'kuittaa', id: t.id });
					break;
				case 'muistutettu': {
					const d = haeTutka.data && haeTutka.data[0] && haeTutka.data[0].d;
					await tutkaToiminto.run({ tyyppi: 'muistutettu', id: t.id, kuka: (d && d.mina) || appsmith.user.name || appsmith.user.email || '' });
					break;
				}
				default:
					return;
			}
			await haeTutka.run();
		} catch (e) {
			showAlert('Tallennus epäonnistui: ' + ((e && e.message) ? e.message : e), 'error');
			await haeTutka.run();
		}
	},
	// Näkymän vaihto: lista | kanban | tutka (muistetaan käyttäjäkohtaisesti)
	async nayta (n) {
		await storeValue('etusivuNakyma', n, true);
		if (n === 'tutka') { await haeTutka.run(); } else { await SelectQuery.run(); }
	},
	viimeisin: null
}
