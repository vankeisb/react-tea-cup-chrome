// var port = chrome.extension.connect({
//     name: "tea-cup dev tools comm"
// });

// Listen to messages from the background page
// port.onMessage.addListener(function (message) {
//     window.postMessage(message, "*");
//     document.body.innerHTML = "<pre>" + JSON.stringify(message, null, 2) + "</pre>";
//
//     //document.querySelector('#insertmessagebutton').innerHTML = message.content;
//     // port.postMessage(message);
// });



// bglog("Panel ready");

// insert content script that kicks the whole process into page

function sendObjectToInspectedPage(message) {
    message.tabId = chrome.devtools.inspectedWindow.tabId;
    chrome.extension.sendMessage(message);
}

sendObjectToInspectedPage({
    action: "script", content: "inserted-script.js"
});