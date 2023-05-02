console.log("~ Popup Script Loaded ~");

// // Clear all storage:
// chrome.storage.local.clear().then(() => {
// 	console.log("Storage cleared");
// });

// Get all storage:
// chrome.storage.local.get(null).then((result) => {
// 	console.log(result);
// });

// All widget user settings are saved to local storage as a single key value pair per tab:
// key = current tab id, value = object with each saved setting representing a new object property.
async function loadPreferencesFromStorage() {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			const tabId = tabs[0].id;
			chrome.storage.local.get([tabId.toString()], (result) => {
				resolve(result[tabs[0].id]);
			});
		});
	});
}

// Toggles the "active" class, does not update storage.
function toggleBtnActive(btn) {
	btn.classList.toggle("active");
	return btn.classList.toString().includes("active");
}

// Used for sending info to contentScript.js
function sendContentMessage(id, value) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { id: id, status: value });
	});
}

// Gather all necessary buttons and elements
const screen_reader_btn = document.getElementById("screen-reader");
const dictionary_btn = document.getElementById("dictionary");
const page_struct_btn = document.getElementById("page-structure");
const text_size_btn = document.getElementById("text-size");
const line_height_btn = document.getElementById("line-height");
const word_spacing_btn = document.getElementById("word-spacing");

let buttons = Array.from(document.getElementsByClassName("button"));
let radios = Array.from(document.getElementsByTagName("input"));
let savedPreferences;

// Updating data via the chrome storage api is asynchronous, so everything
// that uses the updateStorage function needs to be contained within
// the data retrieving promise loadPreferencesFromStorage scope.
loadPreferencesFromStorage().then((result) => {
	// Used to add user settings to local storage
	function updateStorage(id, value) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			savedPreferences[id] = value;
			chrome.storage.local.set({ [tabs[0].id]: savedPreferences }).then((res) => {
				console.log("storage updated: ", res);
			});
		});
	}

	savedPreferences = result;

	if (!savedPreferences) {
		savedPreferences = {};
	}

	// for (let preference of Object.keys(savedPreferences)) {
	// 	sendContentMessage(preference, savedPreferences[preference]);
	// 	// console.log(preference, savedPreferences[preference]);
	// }

	// Check for widget activations
	for (let btn of buttons) {
		// Get any existing active buttons from local storage
		if (savedPreferences[btn.id] == "active") {
			console.log(savedPreferences[btn.id]);
			// All btns are inactive by default whenever the popup is opened.
			toggleBtnActive(btn);
		}

		btn.addEventListener("click", () => {
			if (toggleBtnActive(btn)) {
				updateStorage(btn.id, "active");

				if (btn.id == "text-size") {
					chrome.tabs.setZoom(1);
				}

				// Page structure button closes the popup on click so it will never stay "active"
				if (btn.id == "page-structure") {
					btn.classList.remove("active");
					updateStorage(btn.id, "inactive");
				}

				if (btn.id == "dictionary") {
					sendContentMessage("dictionary", "active");
				}

				if (btn.id == "screen-reader") {
					sendContentMessage("screen-reader", "active");
				}
			} else {
				// Deactivate button
				updateStorage(btn.id, "inactive");

				if (btn.id == "dictionary" || btn.id == "screen-reader") {
					sendContentMessage(btn.id, "inactive");
				}

				// Deactivate subsequent radios buttons
				try {
					// Have to use try/catch here because just running btn.nextElementSibling
					// will throw an error if the button doesn't have radios buttons.
					for (let sub of Array.from(btn.nextElementSibling.childNodes)) {
						sub.checked = false;
						console.log(sub["name"]);
						updateStorage(sub.id, "inactive");
					}
				} catch (err) {
					console.log(err);
				}
			}
		});
	}

	for (let rad of radios) {
		if (savedPreferences[rad.id] == "active") {
			rad.checked = true;
		}

		rad.addEventListener("change", () => {
			rad.parentNode.previousElementSibling.classList.add("active");
			updateStorage(rad.parentNode.previousElementSibling.id, "active");
			sendContentMessage(rad.parentNode.previousElementSibling.id, "active");
			updateStorage(rad.id, "active");
			for (let rad2 of radios) {
				if (rad2.checked != true) {
					updateStorage(rad2.id, "inactive");
				}
			}
		});
	}

	// Line Height Handlers
	function sendLineHeight(height) {
		updateStorage("line-height-value", height);
		sendContentMessage("line-height-value", height);
	}

	line_height_btn.addEventListener("click", () => {
		sendLineHeight("1rem");
	});

	const line_height_radios = document.querySelectorAll(
		'input[name="line-height-set"]'
	);

	for (let rad of line_height_radios) {
		rad.addEventListener("click", () => {
			sendLineHeight(rad.dataset.height);
		});
	}

	// Word Spacing Handlers
	function sendWordSpace(space) {
		updateStorage("word-spacing-value", space);
		sendContentMessage("word-spacing-value", space);
	}

	word_spacing_btn.addEventListener("click", () => {
		sendWordSpace("0rem");
	});

	const word_space_radios = document.querySelectorAll(
		'input[name="spacing-set"]'
	);

	for (let rad of word_space_radios) {
		rad.addEventListener("click", () => {
			sendWordSpace(rad.dataset.space);
		});
	}

	// Screen Reader Handlers
	function sendSpeekSpeed(speed) {
		updateStorage("screen-reader-value", speed);
		sendContentMessage("screen-reader-value", speed);
	}

	const screen_reader_radios = document.querySelectorAll(
		'input[name="reader-set"]'
	);

	for (let rad of screen_reader_radios) {
		rad.addEventListener("click", () => {
			sendSpeekSpeed(rad.dataset.speed);
		});
	}
});

// Text Size Handlers
text_size_btn.addEventListener("click", () => {
	chrome.tabs.setZoom(1);
});

const text_size_radios = document.querySelectorAll(
	'input[name="text-size-set"]'
);
for (let rad of text_size_radios) {
	rad.addEventListener("click", () => {
		chrome.tabs.setZoom(Number(rad.dataset.zoom));
	});
}

// Page Structure Handler
function launchPageStructModal() {
	sendContentMessage("page-struct", null);
}

page_struct_btn.addEventListener("click", () => {
	launchPageStructModal();
	window.close();
});
