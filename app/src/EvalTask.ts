import {err, ok, Result, Task} from "react-tea-cup";

class EvalTask extends Task<Error,any> {

    private readonly code: string;

    constructor(code: string) {
        super();
        this.code = code;
    }

    execute(callback: (r: Result<Error, any>) => void): void {
        try {
            // @ts-ignore
            chrome.devtools.inspectedWindow.eval(
                this.code,
                (result: any, isException: boolean) => {
                    if (isException) {
                        callback(err(result))
                    } else {
                        callback(ok(result))
                    }
                }
            );
        } catch (e) {
            callback(err(e))
        }
    }

}

export function evalInInspectedWindow(code: string): Task<Error,any> {
    return new EvalTask(code);
}