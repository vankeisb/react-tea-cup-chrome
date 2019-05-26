import {Sub} from "react-tea-cup";

// @ts-ignore
const port = chrome.extension.connect({
    name: "tea-cup-dev"
});

let subs: ChromePortSub<any>[] = [];

// Listen to messages from the background page
port.onMessage.addListener((message:any) => {
    subs.forEach(s => s.trigger(message));
});

export class ChromePortSub<M> extends Sub<M> {

    private readonly mapper: (t:number) => M;

    constructor(mapper: (t: number) => M) {
        super();
        this.mapper = mapper;
    }
    protected onInit(): void {
        super.onInit();
        subs.push(this);
    }

    protected onRelease(): void {
        super.onRelease();
        subs = subs.filter(s => s !== this);
    }

    trigger(m:any) {
        this.dispatch(this.mapper(m))
    }
}


export function onChromePortMessage<M>(mapper:(t:any) => M): Sub<M> {
    return new ChromePortSub(mapper);
}