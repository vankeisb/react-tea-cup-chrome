import * as React from "react"
import {
    Cmd,
    Dispatcher,
    noCmd,
    Program,
    Sub,
    HasTime,
    onAnimationFrame,
    Maybe,
    just,
    nothing,
    maybeOf
} from "react-tea-cup";
import {onChromePortMessage} from "./ChromePortSub";
import {ScrollPane} from "./ScrollPane";

type TcEvent
    = TcInit
    | TcUpdate


interface TcInit extends HasTime {
    readonly tag: "tc-init"
    readonly model: any
}


interface TcUpdate extends HasTime {
    readonly tag: "tc-updated"
    readonly msg: any
    readonly model: any
}


interface Model {
    readonly events: ReadonlyArray<TcEvent>
    readonly selected: Maybe<number>
}


type Msg
    = { tag: "tea-cup-event", detail: any }
    | { tag: "event-clicked", index: number }


function prettify(obj:any) {
    return (
        <pre>
            {JSON.stringify(obj, null, 2)}
        </pre>
    );
}


function view(dispatch: Dispatcher<Msg>, model:Model) {
    if (model.events.length === 0) {
        return (
            <p>No events</p>
        )
    } else {
        return (
            <div style={{
                display: "flex",
                flexDirection: "row",
                flexGrow: 1
            }}>
                <div style={{
                    width: "200px",
                    position: "relative",
                    borderRight: "1px solid gray"
                }}>
                    <ScrollPane x={false} y={true}>
                        {viewTimeline(dispatch, model)}
                    </ScrollPane>
                </div>
                <div style={{
                    flexGrow: 1,
                    position: "relative"
                }}>
                    <ScrollPane x={false} y={true}>
                        {viewDetails(dispatch, model)}
                    </ScrollPane>
                </div>
            </div>
        )
    }
}


function viewDetails(dispatch: Dispatcher<Msg>, model: Model) {
    return model.selected
        .map(selectedIndex =>
            maybeOf(model.events[selectedIndex])
                .map(event =>
                    <>
                        <h1>{ "#" + selectedIndex + " - " + getShortEventName(event) }</h1>
                        <h2>Message</h2>
                        <p>TODO</p>
                        <h2>Model</h2>
                        <pre>
                            {prettify(event.model)}
                        </pre>
                    </>
                )
                .withDefault(
                    <p>
                        Invalid event index ???
                    </p>
                )

        )
        .withDefault(
            <p>
                Select an event
            </p>
        )
}


function getShortEventName(e:TcEvent): string {
    switch (e.tag) {
        case "tc-init":
            return "init";
        case "tc-updated":
            return "update";
    }
}

function viewTimeline(dispatch: Dispatcher<Msg>, model: Model) {

    function lnk(i:number, elemText: string) {
        return (
            <a
                href="#"
                onClick={e => {
                    e.preventDefault();
                    dispatch({
                        tag: "event-clicked",
                        index: i
                    });
                }}
            >
                {elemText}
            </a>
        )
    }

    return (
        <ul>
            { model.events.map((event,index) => {
                let shortMsg;
                switch (event.tag) {
                    case "tc-init":
                        shortMsg = "init";
                        break;
                    case "tc-updated":
                        shortMsg = "update";
                        break;
                }
                const elemText = "#" + index + " - " + getShortEventName(event);
                return (
                    <li key={index}>
                        { model.selected
                            .map(selectedIndex =>
                                selectedIndex === index
                                    ? elemText
                                    : lnk(index, elemText)
                            )
                            .withDefault(lnk(index, elemText))
                        }
                    </li>
                )
            })}
        </ul>
    )
}


function update(msg:Msg, model:Model): [Model, Cmd<Msg>] {
    switch (msg.tag) {
        case "tea-cup-event": {
            switch (msg.detail.tag) {
                case "dev-tools-ready": {
                    // push all events
                    const newEvents: TcEvent[] = [];
                    msg.detail.events.forEach((e:any) => {
                        const tce = fromSerializableEvent(e);
                        if (tce.type === "Just") {
                            newEvents.push(tce.value);
                        }
                    });
                    return noCmd({
                        ...model,
                        events: model.events.concat(newEvents)
                    });
                }
                default: {
                    // push individual event
                    return noCmd(
                        fromSerializableEvent(msg.detail)
                            .map(tcEvent => {
                                const newEvents: ReadonlyArray<TcEvent> = [
                                    ...model.events,
                                    tcEvent
                                ];
                                return {
                                    ...model,
                                    events: newEvents
                                }
                            })
                            .withDefault(model)
                    );
                }
            }
        }
        case "event-clicked":
            return noCmd({
                ...model,
                selected: just(msg.index)
            })
    }
}


function init(): [Model, Cmd<Msg>] {
    return noCmd({
        events: [],
        selected: nothing
    });
}


function subscriptions(model: Model): Sub<Msg> {
    return onChromePortMessage(portMsgToMsg)
}

function fromSerializableEvent(e:any): Maybe<TcEvent> {
    // TODO use decoders...
    switch (e.tag) {
        case "init": {
            return just({
                tag: "tc-init",
                time: e.time,
                model: e.model
            })
        }
        case "updated": {
            return just({
                tag: "tc-updated",
                time: e.time,
                model: e.model,
                msg: e.msg
            })
        }
        default:
            return nothing;
    }
}


function portMsgToMsg(portMsg:any): Msg {
    return {
        tag: "tea-cup-event",
        detail: portMsg.detail
    }
}


export const App = () => {
    // @ts-ignore
//    const devTools: DevTools<any, any> = window["teaCupDevTools"];
    return <Program
        init={init}
        view={view}
        update={update}
        subscriptions={subscriptions}
    />;
};
