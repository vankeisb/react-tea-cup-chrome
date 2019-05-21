import * as React from "react"
import {Cmd, Dispatcher, noCmd, Program, Sub, DevToolsEvent, DevTools} from "react-tea-cup";


interface Model {
    readonly count: number
//    readonly events: ReadonlyArray<DevToolsEvent<Model,Msg>>
}


type Msg
    = { tag: "no-op" }


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
    return noCmd({count: 1});
}


function subscriptions(model: Model): Sub<Msg> {
    return Sub.none()
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
