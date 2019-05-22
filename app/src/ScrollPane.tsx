import * as React from "react"

export interface ScrollPaneProps {
    x:boolean
    y:boolean
}

export const ScrollPane: React.FunctionComponent<ScrollPaneProps> = ({x, y, children}) => (
    <div style={{
        position: "absolute",
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
        overflowX: x ? "auto" : "hidden",
        overflowY: y ? "auto" : "hidden"
    }}>
        {children}
    </div>
);