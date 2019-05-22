window.addEventListener('tea-cup-event', event => {
    console.log("Received from tea-cup", event);
    // received event from tea-cup, relay to chrome runtime
    chrome.extension.sendMessage({
        kind: 'tea-cup-event',
        detail: event.detail
    }, function(message){});
}, false);

//Append your pageScript.js to "real" webpage. So will it can full access to webpate.
const s = document.createElement('script');
s.src = chrome.extension.getURL('page-script.js');
(document.head || document.documentElement).appendChild(s);
//Our pageScript.js only add listener to window object,
//so we don't need it after it finish its job. But depend your case,
//you may want to keep it.
s.parentNode.removeChild(s);

console.log("Script inserted");
