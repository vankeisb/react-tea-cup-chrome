window.addEventListener('tea-cup-event', event => {
    // received event from tea-cup, relay to chrome runtime
    debugger;
    chrome.extension.sendMessage({
        kind: 'tea-cup-event',
        detail: event.detail
    }, function(message){});
}, false);

//Append your pageScript.js to "real" webpage. So will it can full access to webpate.
var s = document.createElement('script');
s.src = chrome.extension.getURL('page-script.js');
(document.head || document.documentElement).appendChild(s);
//Our pageScript.js only add listener to window object,
//so we don't need it after it finish its job. But depend your case,
//you may want to keep it.
s.parentNode.removeChild(s);

//Listen for runtime message
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     if(message.action === 'DISPATCH-RUNTIME-MSG') {
//         //fire an event to get duck
//         let event = new CustomEvent('RUNTIME_MSG');
//         window.dispatchEvent(event);
//     }
// });

