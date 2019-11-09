import React, { Component } from "react";

interface IProps {
    vscode: any;
}
interface IState {
    txHash: string | null;
}
// @ts-ignore
// const vscode = acquireVsCodeApi(); // eslint-disable-line

class DebugDisplay extends Component<IProps, IState> {
    public state = {
        txHash: '',
    };
    constructor(props: IProps) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleSubmit(event: any) {
        const { txHash } = this.state;
        event.preventDefault();
        // get tx from txHash & debug transaction
        this.props.vscode.postMessage({
            command: "debugTransaction",
            txHash
        });
    }
    handleChange(event: any) {
        this.setState({ txHash: event.target.value });
    }
    public render() {
        const { txHash } = this.state;
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Transaction hash:
                        <input type="text" value={this.state.txHash} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    }
}
export default DebugDisplay;