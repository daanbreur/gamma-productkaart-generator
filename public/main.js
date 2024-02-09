let queue = [];
let products = [];

const fetchQueue = async () => {
	let data = await fetch(`/getServerData`).then((a) => a.json());
	queue = data.queue;

	UpdateArtNoList();
};

const ClearProducts = async () => {
	let data = await fetch(`/clearProductQueue`).then((a) => a.json());
	queue = data.queue;

	UpdateArtNoList();
};

const getProductsFromQueue = async () => {
	for (let i = 0; i < queue.length; i++) {
		let data = await fetch(`/getProductData?artno=${queue[i]}`).then((a) =>
			a.json()
		);
		products.push(data);
	}
};

const AddProduct = async () => {
	let artno = document.getElementsByName("artno_input")[0].value;
	document.getElementsByName("artno_input")[0].value = "";

	if (artno != "") {
		let data = await fetch(`/addProductToQueue?artno=${artno}`).then((a) =>
			a.json()
		);
		queue = data.queue;

		UpdateArtNoList();
	}
};

const UpdateArtNoList = () => {
	let list = document.getElementById("artno_list");
	list.innerHTML = "";

	for (i = 0; i < queue.length; i++) {
		let li = document.createElement("li");
		li.innerText = queue[i];
		list.appendChild(li);
	}
};

const RenderProducts = async () => {
	await getProductsFromQueue();

	document
		.querySelectorAll(".printableContent:not(#disclaimer)")
		.forEach((a) => a.remove());

	const chunkSize = 10;
	for (let i = 0; i < products.length; i += chunkSize) {
		const chunk = products.slice(i, i + chunkSize);

		var printableContentDiv = document.createElement("div");
		printableContentDiv.classList.add("printableContent");
		var gridContainerDiv = document.createElement("div");
		gridContainerDiv.classList.add("grid-container");

		for (let j = 0; j < chunk.length; j++) {
			var gridItemDiv = document.createElement("div");
			gridItemDiv.classList.add("grid-item");

			var leftContentDiv = document.createElement("div");
			leftContentDiv.classList.add("left-content");

			var imageElement = document.createElement("img");
			imageElement.classList.add("image");
			imageElement.src = chunk[j].imageUrl;
			imageElement.alt = "";

			leftContentDiv.appendChild(imageElement);

			var rightContentDiv = document.createElement("div");
			rightContentDiv.classList.add("right-content");

			var textWrapperDiv = document.createElement("div");
			textWrapperDiv.classList.add("text-wrapper");

			var text1Div = document.createElement("div");
			text1Div.textContent = chunk[j].title;
			var text2Div = document.createElement("div");
			text2Div.textContent = `ArtNo: ${chunk[j].artikelNummer}`;
			textWrapperDiv.appendChild(text1Div);
			textWrapperDiv.appendChild(text2Div);

			var smallImageElement = document.createElement("img");
			smallImageElement.classList.add("small-image");
			smallImageElement.src = `https://barcode.tec-it.com/barcode.ashx?data=${chunk[j].ean}&code=EAN13&translate-esc=on`;
			smallImageElement.alt = "";

			rightContentDiv.appendChild(textWrapperDiv);
			rightContentDiv.appendChild(smallImageElement);

			gridItemDiv.appendChild(leftContentDiv);
			gridItemDiv.appendChild(rightContentDiv);

			gridContainerDiv.appendChild(gridItemDiv);
		}

		printableContentDiv.appendChild(gridContainerDiv);
		document.body.appendChild(printableContentDiv);
	}

	window.print();
};
