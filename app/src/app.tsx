import * as React from "react"
import {Cmd, Dispatcher, noCmd, Program, Sub} from "react-tea-cup";


interface Model {
    readonly count: number
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


export const App = () => (
    <Program
        init={init}
        view={view}
        update={update}
        subscriptions={subscriptions}
    />
);