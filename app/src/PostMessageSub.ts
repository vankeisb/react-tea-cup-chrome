import {Sub} from "react-tea-cup";

let subs: PostMessageSub<any>[] = [];

function startListening() {
    window.addEventListener("message", onMessage, false)
}

function onMessage(m:any) {
    subs.forEach(s => s.trigger(m))
}

function stopListening() {
    window.removeEventListener("message", onMessage);
}

export class PostMessageSub<Msg> extends Sub<Msg> {

    private readonly mapper: (t:number) => Msg;

    constructor(mapper: (t: number) => Msg) {
        super();
        this.mapper = mapper;
    }
    protected onInit(): void {
        super.onInit();
        subs.push(this);
        startListening();
    }

    protected onRelease(): void {
        super.onRelease();
        subs = subs.filter(s => s !== this);
        if (subs.length === 0) {
            stopListening();
        }
    }

    trigger(m:any) {
        this.dispatch(this.mapper(m))
    }
}


export function onPostMessage<Msg>(mapper:(t:any) => Msg): Sub<Msg> {
    return new PostMessageSub(mapper);
}