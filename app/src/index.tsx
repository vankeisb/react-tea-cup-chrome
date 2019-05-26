import {App} from "./app";
import * as React from "react";
import * as ReactDOM from "react-dom"

ReactDOM.render(<App/>, document.getElementById('app'));

// @ts-ignore
function sendObjectToInspectedPage(message) {
    // @ts-ignore
    message.tabId = chrome.devtools.inspectedWindow.tabId;
    // @ts-ignore
    chrome.extension.sendMessage(message);
}

sendObjectToInspectedPage({
    action: "script", content: "inserted-script.js"
});