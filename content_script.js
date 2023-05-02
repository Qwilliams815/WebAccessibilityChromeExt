console.log("~ Content Script Loaded ~");

// chrome.storage.local.get(null).then((result) => {
// 	console.log(result);
// });

// Gather all necessary web page elements
let bodyElements = document.body.getElementsByTagName("*");
let headers = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
let paragraphs = Array.from(document.querySelectorAll("p"));

// Retrieve current tab id from background script
chrome.runtime.sendMessage({ action: "getTabId" }, function (response) {
	console.log(response.tabId);
	chrome.storage.local.get([response.tabId.toString()]).then((result) => {
		let preferences = result[response.tabId.toString()];
		console.log(preferences);

		// Load and activate any saved settings for the current tab
		if (preferences) {
			for (let preference of Object.keys(preferences)) {
				widgetHandler({ id: preference, status: preferences[preference] });
			}
		}
	});
});

// Page Structure Handlers
let modalWrapper = document.createElement("div");
modalWrapper.setAttribute("id", "ext-structure-modal");

// Create shadow root for styling modal seperately from inherited page styling
const structShadowRoot = modalWrapper.attachShadow({ mode: "open" });

structShadowRoot.innerHTML = `
	<style>

	#ext-structure-modal {
		width: 500px;
	}
	
	#ext-structure-modal h1 {
		font-size: 30px;
		padding: 20px;
	}

	#ext-structure-modal p {
		margin: 10px;
	}

	.accordion,
	.has-drop,
	.close-modal-btn {
	  background-color: #eee;
	  color: #444;
	  padding: 18px;
	  width: 100%;
	  text-align: left;
	  border: none;
	  outline: none;
	  transition: 0.4s;
	  align-items: center;
	}
	
	.accordion {
	  margin-bottom: 5px;
	  display: flex;
	  justify-content: space-between;
	  max-height: 100px;
	}

	.accordion p {
		white-space: nowrap; 
		width: 250px; 
		overflow: hidden;
		text-overflow: ellipsis; 
	}
	
	.has-dropdown:after {
	  content: "+";
	  font-size: 25px;
	  color: #777;
	  float: right;
	}
	
	.active-acc,
	.has-dropdown:hover,
	.close-modal-btn:hover {
	  background-color: #ccc;
	  cursor: pointer;
	}
	
	.active-acc:after {
	  content: "-";
	}
	
	.dropdown {
	  padding: 0 18px;
	  background-color: white;
	  max-height: 0;
	  line-height: 1.6;
	  overflow: hidden;
	  transition: max-height 0.2s ease-out;
	}
	
	.close-modal-btn {
	  text-align: center;
	  border: solid;
	  margin-top: 15px;
	}
	
	.text-width-limit {
	  width: 295px;
	}
	
	
	.header-link-ext {
	  position: absolute;
	  right: 100px;
	  text-decoration: none;
	}

	.header-link-ext:hover {
		text-decoration: underline;
	}

	*:target {
		background: orange;
	}

	</style>`;

shadowModal = document.createElement("dialog");
shadowModal.setAttribute("id", "ext-structure-modal");

const modalTitle = document.createElement("h1");
modalTitle.textContent = "Page Structure";
modalWrapper.append(modalTitle);

// Initialize count for assigning incrementing id's for page link navigation
let modalHeaderId = 0;
let accordions = [];
let links = [];

//1. Cycle through body of doc
for (let el of bodyElements) {
	//2. If current element is a header, create a button for it
	if (headers.includes(el)) {
		el.setAttribute("id", `ext-body-header-${modalHeaderId}`);

		let button = document.createElement("button");

		button.innerHTML = `<p>(${el.tagName}): ${el.textContent}</p>`;
		button.classList.add("accordion");

		let headerLink = document.createElement("a");
		headerLink.textContent = "Link";
		headerLink.setAttribute("href", `#${el.id}`);
		headerLink.classList.add("header-link-ext");
		links.push(headerLink);
		button.append(headerLink);

		accordions.push(button);
		shadowModal.append(button);
		modalHeaderId++;

		//3. Else if the current element is a p, give it the dropdown class
		// and add it to the shadowModal
	} else if (paragraphs.includes(el)) {
		let dropdown = document.createElement("div");
		dropdown.innerHTML = `<p>${el.textContent}</p>`;
		dropdown.classList.add("dropdown");
		shadowModal.append(dropdown);
	}
}

let close_modal_btn = document.createElement("button");
close_modal_btn.setAttribute("class", "close-modal-btn");
close_modal_btn.textContent = "Close";
close_modal_btn.addEventListener("click", (e) => {
	shadowModal.close();
});

shadowModal.append(close_modal_btn);

// Adding event listeners to the header button accordions
for (let accordion of accordions) {
	if (accordion.nextElementSibling.classList.contains("dropdown")) {
		accordion.classList.add("has-dropdown");
		accordion.addEventListener("click", (e) => {
			accordion.classList.toggle("active-acc");
			// If next element is not another header,
			let acc_dropdown = accordion.nextElementSibling;
			if (acc_dropdown.style.maxHeight) {
				acc_dropdown.style.maxHeight = null;
			} else {
				acc_dropdown.style.maxHeight = acc_dropdown.scrollHeight + "px";
			}
		});
	}
}

// Adding event listeners for document header links
for (let link of links) {
	link.addEventListener("click", () => {
		let link_href = link.getAttribute("href");
		let link_target = document.querySelector(link_href);
		console.log(link_target);
		link_target.scrollIntoView({ behavior: "smooth" });
		link_target.style["background-color"] = "orange";
		shadowModal.close();
	});
}

structShadowRoot.append(shadowModal);
document.body.append(modalWrapper);

// Dictionary Handlers
const dictShadowHost = document.createElement("div");
const dictShadowRoot = dictShadowHost.attachShadow({ mode: "open" });

dictShadowRoot.innerHTML = `
  <style>

  p {
	line-height: 23px;
  }
  
  </style>`;

const dictTooltip = document.createElement("div");
dictTooltip.setAttribute("id", "tooltipDiv");
let tooltipWord = document.createElement("h1");
tooltipWord.setAttribute("id", "tooltipWord");
let tooltipDef = document.createElement("p");
tooltipDef.setAttribute("id", "tooltipDef");
let tooltipLink = document.createElement("a");
tooltipLink.setAttribute("id", "tooltipLink");

const dictAPI = "https://api.dictionaryapi.dev/api/v2/entries/en/";
dictTooltip.append(tooltipWord, tooltipDef, tooltipLink);

dictShadowRoot.append(dictTooltip);
document.body.append(dictShadowHost);

// Used to show/position dictionary definition tooltip popup
function showTooltip() {
	dictTooltip.style.cssText = `
		   display: block;
		   position: absolute; 
		   background: white;
		   border: 3px solid #666;
		   padding: 12px 12px 12px 12px;
		   width: 300px;
		   left: ${event.clientX + window.scrollX + 10}px; 
		   top: ${event.clientY + window.scrollY + 15}px;`;
}

async function getWordData() {
	let APIres = await fetch(dictAPI + text);
	let wordJSON = await APIres.json();

	return {
		word: wordJSON[0].word,
		def: wordJSON[0].meanings[0].definitions[0].definition,
	};
}

// Populates tooltip with retrieved word data
function updateTooltip() {
	getWordData()
		.then((wordData) => {
			console.log(wordData.word, wordData.def);
			tooltipWord.innerHTML =
				wordData.word.charAt(0).toUpperCase() + wordData.word.slice(1);
			tooltipDef.innerHTML = wordData.def;
			tooltipLink.innerHTML = "More >>";
			tooltipLink.setAttribute("target", "_blank");
			tooltipLink.setAttribute(
				"href",
				`https://www.google.com/search?dictcorpus=en-US&hl=en&forcedict=or&q=define%20${wordData.word}`
			);
		})
		.catch((err) => {
			tooltipDef.innerHTML = "No definition available";
		});

	showTooltip();
}

// Get/validate hightlighted word
function dictionaryValidator() {
	if (window.getSelection) {
		text = window.getSelection().toString().trim();
		if (text) {
			updateTooltip();
		} else {
			dictTooltip.style.cssText = "display: none;";
		}
	}

	// Click again to close tooltip
	document.addEventListener("click", () => {
		dictTooltip.style.cssText = "display: none;";
		// blank out box to deal with weird pop-in issue where old values would show for a sec
		tooltipWord.innerHTML = "";
		tooltipDef.innerHTML = "";
		tooltipLink.innerHTML = "";
	});
}

function enableDictionary(status) {
	console.log(status);
	if (status == "active") {
		console.log("Dictionary enabled");
		document.addEventListener("dblclick", dictionaryValidator);
	} else {
		console.log("dict disabled");
		document.removeEventListener("dblclick", dictionaryValidator);
	}
}

// Screen Reader Handlers
let speechSpeed = 1;

function speakSelection(e) {
	selectedElement = e.target;
	selectedElement.style.backgroundColor = "yellow";

	let textSelection = new SpeechSynthesisUtterance();
	let voices = speechSynthesis.getVoices();
	textSelection.voice = voices[0];
	textSelection.text = selectedElement.innerText;
	textSelection.rate = speechSpeed;
	selectedElement.style.backgroundColor = "yellow";
	speechSynthesis.speak(textSelection);

	let interval = setInterval(() => {
		if (!speechSynthesis.speaking) {
			selectedElement.style.removeProperty("background-color");
			clearInterval(interval);
		}
	}, 100);
}

function enableScreenReader(status) {
	let text = document.querySelectorAll("p,h1,h2,h3");

	text.forEach((el) => {
		if (status == "active") {
			el.addEventListener("click", speakSelection);
		} else {
			el.removeEventListener("click", speakSelection);
		}
	});
}

// Popup.js Message Catch-all
function widgetHandler(btn) {
	if (btn.id == "line-height-value") {
		document.body.style["line-height"] = btn.status;
		for (let el of Array.from(document.getElementsByTagName("a"))) {
			el.style["line-height"] = btn.status;
		}
	} else if (btn.id == "word-spacing-value") {
		document.body.style["word-spacing"] = btn.status;
	} else if (btn.id == "page-struct") {
		shadowModal.showModal();
	} else if (btn.id == "dictionary") {
		console.log(btn.status);
		enableDictionary(btn.status); // true / false
	} else if (btn.id == "screen-reader") {
		enableScreenReader(btn.status);
	} else if (btn.id == "screen-reader-value") {
		speechSpeed = btn.status;
		console.log(btn.status);
	}
}

function gotMessage(request, sender, sendResponse) {
	widgetHandler(request);
}

chrome.runtime.onMessage.addListener(gotMessage);
