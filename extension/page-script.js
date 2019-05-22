const devTools = window["teaCupDevTools"];

const attached = devTools !== undefined;

if (attached) {
    devTools.observe(e => {
        // broadcast the events from the teaccup dev tools
        window.dispatchEvent(new CustomEvent("tea-cup-event", {
            detail: toSerializableEvent(e)
        }));
    });

    window.dispatchEvent(new CustomEvent("tea-cup-event", {
        detail: {
            tag: "dev-tools-ready",
            events: devTools.events.map(toSerializableEvent)
        }
    }));
}

function toSerializableEvent(e) {
    const res = {
        tag: e.tag,
        time: e.time
    };
    switch (e.tag) {
        case "init":
            res.model = e.model;
            break;
        case "updated":
            res.msgNum = e.msg.msgNum;
            res.msg = toSerializableAny(e.msg);
            res.model = e.modelAfter;
            break;
    }
    return res;
}

function toSerializableAny(o) {
    const t = typeof o;
    switch (t) {
        case 'function':
            return "[function]";
        case 'object': {
            const res = {};
            for (let name in o) {
                if (o.hasOwnProperty(name)) {
                    const serializedProp = toSerializableAny(o[name]);
                    if (serializedProp !== null) {
                        res[name] = serializedProp;
                    }
                }
            }
            return res;
        }
        default: {
            if (Array.isArray(o)) {
                return o.map(toSerializableAny)
            } else {
                return o;
            }
        }
    }
}
