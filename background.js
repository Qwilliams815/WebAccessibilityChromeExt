console.log("New Message from Background Script!");

// Sends tab id to content script on page load
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action == "getTabId") {
		try {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				sendResponse({ tabId: tabs[0].id });
			});
		} catch (error) {
			console.log("No current Tab");
		}

		return true;
	}
});
