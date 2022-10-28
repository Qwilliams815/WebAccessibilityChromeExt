// This is all the logic that needs to access the chrome API
console.log("New Message from Background Script!");
console.log("test");
// chrome.tabs.sendMessage(tab.id, "Hello from the background!");

// "default_popup": "index.html"

// function createTab() {
//     chrome.tabs.create({url: 'https://www.google.com/'});
// }

// function buttonClicked(tab) {
//     // console.log(tab)
//     let msg = {txt: `Message from background -> content script: ${tab.id}`}
//     chrome.tabs.sendMessage(tab.id, msg);
//     console.log("tab id: ", tab.id);
// }

// chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
//     console.log(response.message)
 
// })

// chrome.action.onClicked.addListener(createTab);
// chrome.action.onClicked.addListener(buttonClicked);

// async function getCurrentTab() {
//     let queryOptions = { active: true, lastFocusedWindow: true };
//     // `tab` will either be a `tabs.Tab` instance or `undefined`.
//     let [tab] = await chrome.tabs.query(queryOptions);
//     console.log(tab.id);
//   }

// getCurrentTab();