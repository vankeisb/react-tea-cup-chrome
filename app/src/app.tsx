import * as React from "react"
import {Cmd, Dispatcher, noCmd, Program, Sub, HasTime} from "react-tea-cup";
import {onPostMessage} from "./PostMessageSub";

type TeaCupEvent
    = TcInit
    | TcUpdate


interface TcInit extends HasTime{
    readonly tag: "tc-init"
}


interface TcUpdate extends HasTime {
    readonly tag: "tc-updated"
}


interface Model {
    readonly events: ReadonlyArray<TeaCupEvent>
}


type Msg
    = { tag: "no-op" }
    | { tag: "dev-tools-msg", data: any }


function view(dispatch: Dispatcher<Msg>, model:Model) {
    return (
        <div>
            Hey hoo
        </div>
    )
}


function update(msg:Msg, model:Model): [Model, Cmd<Msg>] {
    return noCmd(model);
}


function init(): [Model, Cmd<Msg>] {
    return noCmd({events: []});
}


function subscriptions(model: Model): Sub<Msg> {
    return onPostMessage(msg => {
        return {
            tag: "dev-tools-msg",
            data: msg
        }
    })
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
