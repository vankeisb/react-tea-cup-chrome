import * as React from "react"
import {Cmd, Dispatcher, noCmd, Program, Sub, HasTime, onAnimationFrame, Maybe, just, nothing} from "react-tea-cup";
import {onChromePortMessage} from "./ChromePortSub";

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
}


type Msg
    = TeaCupEvent
    | NoOp


interface NoOp {
    readonly tag: "noop"
}

interface TeaCupEvent {
    readonly tag: "tea-cup-event"
    readonly detail: any
}


function prettify(obj:any) {
    return (
        <pre>
            {JSON.stringify(obj, null, 2)}
        </pre>
    );
}


function view(dispatch: Dispatcher<Msg>, model:Model) {

    function msgCell(e:TcEvent) {
        switch (e.tag) {
            case "tc-init": {
                return "init";
            }
            case "tc-updated": {
                return prettify(e.msg);
            }
        }
    }

    if (model.events.length === 0) {
        return (
            <p>No events</p>
        )
    } else {
        return (
            <table>
                <tbody>
                { model.events.map((event,index) =>
                    <tr key={index}>
                        <td>
                            { index }
                        </td>
                        <td>
                            { event.time }
                        </td>
                        <td>
                            { msgCell(event) }
                        </td>
                        <td>
                            { prettify(event.model) }
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        )
    }
}


function update(msg:Msg, model:Model): [Model, Cmd<Msg>] {
    switch (msg.tag) {
        case "noop":
            return noCmd(model);
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
    }
}


function init(): [Model, Cmd<Msg>] {
    return noCmd({events: []});
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
