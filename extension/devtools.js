chrome.devtools.panels.create("Tea Cup",
    "MyPanelIcon.png",
    "panel.html",
    function(panel) {
      // code invoked on panel creation

        // chrome.devtools.inspectedWindow.eval(
        //     "console.log('FFFFF');",
        //     function(result, isException) { }
        // );

    }
);

// this reloads all hosted scripts on page reload
chrome.devtools.network.onNavigated.addListener(() => {
    chrome.extension.sendMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        action: "script", content: "inserted-script.js"
    });
});
//     chrome.devtools.inspectedWindow.eval(
//         `
// const devTools = window["teaCupDevTools"];
// if (devTools) {
//     devTools.observe(e => {
//         // broadcast the events from the teaccup dev tools
//         window.dispatchEvent(new CustomEvent("tea-cup-event", {
//             detail: toSerializableEvent(e)
//         }));
//     });
//
//     window.dispatchEvent(new CustomEvent("tea-cup-event", {
//         detail: {
//             tag: "dev-tools-ready",
//             events: devTools.events.map(toSerializableEvent)
//         }
//     }));
// }
//
// function toSerializableEvent(e) {
//     const res = {
//         tag: e.tag,
//         time: e.time
//     };
//     switch (e.tag) {
//         case "init":
//             res.model = toSerializableAny(e.model);
//             break;
//         case "updated":
//             res.msgNum = e.msg.msgNum;
//             res.msg = toSerializableAny(e.msg);
//             res.model = toSerializableAny(e.modelAfter);
//             res.cmd = toSerializableAny(e.cmd);
//             break;
//     }
//     return res;
// }
//
// function toSerializableAny(o) {
//     const t = typeof o;
//     switch (t) {
//         case 'function':
//             return "[function]";
//         case 'object': {
//             const res = {};
//             for (let name in o) {
//                 if (o.hasOwnProperty(name)) {
//                     const serializedProp = toSerializableAny(o[name]);
//                     if (serializedProp !== null) {
//                         res[name] = serializedProp;
//                     }
//                 }
//             }
//             return res;
//         }
//         default: {
//             if (Array.isArray(o)) {
//                 return o.map(toSerializableAny)
//             } else {
//                 return o;
//             }
//         }
//     }
// }
//
// `,
//         (result, isException) => {
//             debugger;
//             if (isException) {
//                 console.log("ERROR")
//             } else {
//                 console.log("OK")
//             }
//         }
//     );
// });
