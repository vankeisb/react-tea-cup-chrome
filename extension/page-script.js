const devTools = window["teaCupDevTools"];

const attached = devTools !== undefined;

if (attached) {
    devTools.addListener(e => {
        // broadcast the events from the teaccup dev tools
        window.dispatch(new CustomEvent("tea-cup-event", {
            detail: {
                kind: "evt"
            }
        }));
    })
}

window.dispatchEvent(new CustomEvent("tea-cup-event", {
    detail: {
        kind: "init"
    }
}));