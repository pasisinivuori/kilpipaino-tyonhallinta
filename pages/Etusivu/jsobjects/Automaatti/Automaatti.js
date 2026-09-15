export default {
	kaynnistaAutomaattipaivitys: async () => {
		clearInterval("etusivuPoll");
		setInterval(async () => {
			await SelectQuery.run();
			await storeValue("etusivuPaivitetty", moment().format("HH:mm:ss"));
		}, 60000, "etusivuPoll");
		await storeValue("etusivuPaivitetty", moment().format("HH:mm:ss"));
	}
}