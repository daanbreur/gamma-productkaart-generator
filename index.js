const { JSDOM } = require("jsdom");
const express = require("express");
const app = express();
const port = 3000;

const globalState = { queue: [] };

const getArtikel = async (artikelnummer) => {
	let data = await fetch(`https://gamma.nl/p/${artikelnummer}`, {
		redirect: "follow",
	}).then((a) => a.text());
	const dom = new JSDOM(data);

	try {
		let naam = dom.window.document.querySelector(
			"body > div:nth-child(4) > div > div:nth-child(1) > div > main > div > div.row.pdp-blocks.d-block > div.col-12.col-md-6.pdp-head.order-1 > div.pageheader.js-pageheader-mobile > h1"
		).textContent;

		let imageurl = dom.window.document
			.querySelector(
				"body > div:nth-child(4) > div > div:nth-child(1) > div > main > div > div.row.pdp-blocks.d-block > div.col-12.col-md-6.pdp-image.order-2 > div > div.pdp-product-image > div.pinch-zoom.js-pinch-zoom.js-swipeable > img"
			)
			.getAttribute("data-zoom");

		let ean = dom.window.document
			.querySelector(
				"#product-specifications > div > table:nth-child(1) > tbody > tr:nth-child(2) > td > span"
			)
			.textContent.trim();

		return {
			title: naam,
			imageUrl: imageurl,
			ean: ean,
			artikelNummer: artikelnummer,
		};
	} catch (error) {
		return {
			error: `error in ${artikelnummer}`,
		};
	}
};

app.use(express.static("public"));

app.get("/getProductData", async (req, res) => {
	let artikelnummer = req.query["artno"];
	let data = await getArtikel(artikelnummer);

	res.json(data);
});

app.get("/addProductToQueue", async (req, res) => {
	let artikelnummer = req.query["artno"];
	globalState.queue.push(artikelnummer);
	res.json(globalState);
});

app.get("/getServerData", (req, res) => {
	res.json(globalState);
});

app.get("/clearProductQueue", (req, res) => {
	globalState.queue = [];
	res.json(globalState);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
