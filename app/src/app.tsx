import * as React from "react"
import {
    Cmd,
    Dispatcher,
    noCmd,
    Program,
    Sub,
    HasTime,
    Maybe,
    just,
    nothing,
    maybeOf, Task, Result, Tuple
} from "react-tea-cup";
import {onChromePortMessage} from "./ChromePortSub";
import {ScrollPane} from "./ScrollPane";
import {evalInInspectedWindow} from "./EvalTask";
import {CSSProperties} from "react";

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
    readonly cmd: any
}


interface Model {
    readonly events: ReadonlyArray<TcEvent>
    readonly selected: Maybe<number>
    readonly travelling: boolean
    readonly evalError: Maybe<EvalError>
}


interface EvalError {
    readonly code: string
    readonly error: Error
}


type Msg
    = { tag: "tea-cup-event", detail: any }
    | { tag: "event-clicked", index: number }
    | { tag: "prev-next", isNext: boolean }
    | { tag: "toggle-travel" }
    | { tag: "eval-result", code: string, r: Result<Error,any> }
    | { tag: "log-msg", index:number }
    | { tag: "log-model", index:number }
    | { tag: "log-cmd", index:number }


function prettify(obj:any) {
    return (
        <pre>
            {JSON.stringify(obj, null, 2)}
        </pre>
    );
}

const bannerStyle: CSSProperties = {
    padding: "8px"
};

const bannerStyleError: CSSProperties = {
    ...bannerStyle,
    backgroundColor: "#FF8784"
};

const bannerStyleWarning: CSSProperties = {
    ...bannerStyle,
    backgroundColor: "#FFCF9E"
};

const bannerStyleSuccess: CSSProperties = {
    ...bannerStyle,
    backgroundColor: "#90ee90"
};

function viewBanner(dispatch: Dispatcher<Msg>, model: Model) {
    const btn =
        <button
            style={{
                marginRight: "8px"
            }}
            onClick={() => dispatch({
                tag: "toggle-travel"
            })}
            disabled={model.selected.type === "Nothing"}
        >
            { model.travelling ? "Resume" : "Travel" }
        </button>;

    return model.evalError
        .map(err =>
            <div style={bannerStyleError}>
                An error occured: {err.error.message}
            </div>
        )
        .withDefault(
            model.travelling
                ?
                    <div style={bannerStyleWarning}>
                        {btn}
                        You are time travelling, the app is stopped. Resume to re-start at the last event.
                    </div>
                :
                    <div style={bannerStyleSuccess}>
                        {btn}
                        { model.selected
                            .map(() => "App is running, and ready to travel !")
                            .withDefault("App is running. Select an event to explore and enable time-travel.")
                        }
                    </div>
        )
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
                flexDirection: "column",
                flexGrow: 1
            }}>
                {viewBanner(dispatch, model)}
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    flexGrow: 1
                }}>
                    <div style={{
                        borderRight: "1px solid gray",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        {viewTimeline(dispatch, model)}
                    </div>
                    <div style={{
                        flexGrow: 1,
                        position: "relative",
                        display: "flex"
                    }}>
                        {viewDetails(dispatch, model)}
                    </div>
                </div>
            </div>
        )
    }
}


const fullPageDetailsStyle: CSSProperties = {
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5em"
};


function viewDetails(dispatch: Dispatcher<Msg>, model: Model) {
    return model.selected
        .map(selectedIndex =>
            maybeOf(model.events[selectedIndex])
                .map(event => {
                    let msg;
                    switch (event.tag) {
                        case "tc-init": {
                            msg = <p>Application init.</p>;
                            break;
                        }
                        case "tc-updated": {
                            msg =
                                <>
                                    <h2>Message</h2>
                                    <pre>
                                        {prettify(event.msg)}
                                    </pre>
                                    <button onClick={() => dispatch({
                                        tag: "log-msg",
                                        index: selectedIndex
                                    })}>
                                        log in console
                                    </button>
                                    <h3>Command</h3>
                                    <pre>
                                        {prettify(event.cmd)}
                                    </pre>
                                    <button onClick={() => dispatch({
                                        tag: "log-cmd",
                                        index: selectedIndex
                                    })}>
                                        log in console
                                    </button>
                                </>
                        }
                    }
                    return (
                        <ScrollPane x={false} y={true}>
                            <div style={{
                                paddingLeft: "8px"
                            }}>
                                <h1>{"#" + selectedIndex + " - " + getShortEventName(event)}</h1>
                                {msg}
                                <h2>Model</h2>
                                <pre>
                                    {prettify(event.model)}
                                </pre>
                                <button onClick={() => dispatch({
                                    tag: "log-model",
                                    index: selectedIndex
                                })}>
                                    log in console
                                </button>
                            </div>
                        </ScrollPane>
                    )
                })
                .withDefault(
                    <div style={fullPageDetailsStyle}>
                        Invalid event index ???
                    </div>
                )

        )
        .withDefault(
            <div style={fullPageDetailsStyle}>
                Select an event
            </div>
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
        <>
            <div style={{
                paddingLeft: "8px",
                paddingRight: "8px"
            }}>
                <h1>Events ({model.events.length})</h1>
                <div>
                    <button
                        disabled={model.selected
                            .map(i => i === 0)
                            .withDefault(true)
                        }
                        onClick={() => dispatch({
                            tag: "prev-next",
                            isNext: false
                        })}
                    >
                        {"<- prev"}
                    </button>
                    <button
                        disabled={model.selected
                            .map(i => i === model.events.length - 1)
                            .withDefault(true)
                        }
                        onClick={() => dispatch({
                            tag: "prev-next",
                            isNext: true
                        })}
                    >
                        {"next ->"}
                    </button>
                </div>
            </div>
            <div style={{
                flexGrow: 1,
                position: "relative"
            }}>
                <ScrollPane x={false} y={true}>
                    <table className="events">
                        <thead>
                        <tr>
                            <th> </th>
                            <th>#</th>
                            <th>time</th>
                        </tr>
                        </thead>
                        <tbody>
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

                            const selected = model.selected
                                .map(i => i === index)
                                .withDefault(false);

                            const className = selected ? " active" : "";

                            return (
                                <tr key={index}
                                    className={"row" + className}
                                    onClick={() => {
                                        if (!selected) {
                                            dispatch({
                                                tag: "event-clicked",
                                                index: index
                                            });
                                        }
                                    }}
                                >
                                    <th className="row-head">
                                    </th>
                                    <td>
                                        { index }
                                    </td>
                                    <td>
                                        { event.time }
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </ScrollPane>
            </div>
        </>
    )
}


function update(msg:Msg, model:Model): [Model, Cmd<Msg>] {
    console.log("msg", msg);
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
                        events: newEvents,
                        selected: nothing
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
            return setSelected(model, just(msg.index));

        case "prev-next":
            return setSelected(
                model,
                model.selected
                    .map(i => {
                        if (msg.isNext) {
                            return Math.min(model.events.length -1, i + 1);
                        } else {
                            return Math.max(0, i - 1);
                        }
                    })
            );

        case "toggle-travel": {
            // send code into injected page so to "pilot" the devtools
            const newModel = {...model, travelling: !model.travelling };
            if (model.travelling) {
                // resume program
                return Tuple.t2n(
                    {
                        ...newModel,
                        selected: nothing
                    },
                    evalInPage("teaCupDevTools.resume();")
                );
            } else {
                // travel to selected (if any)
                return setSelected(newModel, newModel.selected);
            }
        }

        case "eval-result":
            return noCmd({
                ...model,
                evalError: msg.r.match(
                    (s:any) => nothing,
                    (e:Error) => just({
                        error: e,
                        code: msg.code
                    })
                )
            });

        case "log-model":
            return Tuple.t2n(
                model,
                evalInPage(`console.dir(teaCupDevTools.events[${msg.index}].modelAfter || teaCupDevTools.events[${msg.index}].model);`)
            );

        case "log-msg":
            return Tuple.t2n(
                model,
                evalInPage(`console.dir(teaCupDevTools.events[${msg.index}].msg);`)
            );

        case "log-cmd":
            return Tuple.t2n(
                model,
                evalInPage(`console.dir(teaCupDevTools.events[${msg.index}].cmd);`)
            );
    }
}

function setSelected(model:Model, selected: Maybe<number>): [Model, Cmd<Msg>] {
    return Tuple.t2n(
        {
            ...model,
            selected: selected
        },
        selected
            .map(s =>
                model.travelling
                    ? evalInPage(`teaCupDevTools.travelTo(${s});`)
                    : Cmd.none<Msg>()
            )
            .withDefault(Cmd.none())
    );
}


function evalInPage(code: string): Cmd<Msg> {
    return Task.attempt(
        evalInInspectedWindow(code),
        (r:Result<Error,any>) => {
            return {
                tag: "eval-result",
                code: code,
                r: r
            };
        }
    );
}



function init(): [Model, Cmd<Msg>] {
    return noCmd({
        events: [],
        selected: nothing,
        travelling: false,
        evalError: nothing
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
                msg: e.msg,
                cmd: e.cmd
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
    return <Program
        init={init}
        view={view}
        update={update}
        subscriptions={subscriptions}
    />;
};
