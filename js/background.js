function checkForValidUrl(tabId, changeInfo, tab){
	if (tab.url.indexOf('http://mpfi:36/') > -1) {
		chrome.pageAction.show(tabId);
	}else if(tab.url.indexOf('http://www.felixmad.es/mpfi/') > -1) {
		chrome.pageAction.show(tabId);
	}  
};
chrome.tabs.onUpdated.addListener(checkForValidUrl);