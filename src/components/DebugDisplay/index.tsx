import React, { Component } from "react";

interface IProps {
    vscode: any;
    txTrace: any;
}
interface IState {
    txHash: string | null;
    debugObj: object
    indx: any
}
// @ts-ignore
// const vscode = acquireVsCodeApi(); // eslint-disable-line

class DebugDisplay extends Component<IProps, IState> {
    public state = {
        txHash: '',
        debugObj: {},
        indx: -1
    };
    constructor(props: IProps) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.stopDebug = this.stopDebug.bind(this);
        this.debugInto = this.debugInto.bind(this);
        this.debugBack = this.debugBack.bind(this);
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
    componentDidUpdate(prevProps: IProps) {
        if(this.props.txTrace !== prevProps.txTrace) {
            this.setState({
                indx: 0,
                debugObj: this.props.txTrace[0]
            })
        }
    }
    handleChange(event: any) {
        this.setState({ txHash: event.target.value });
    }
    stopDebug() {
        this.setState({ indx: -1, debugObj: {} });
    }
    debugInto() {
        const { txTrace } = this.props;
        if(txTrace.length > 0) {
            const index = (this.state.indx < txTrace.length-1) ?
            this.state.indx+1 : 
            txTrace.length-1;
            this.setState({ 
                indx: index, 
                debugObj: txTrace[index] 
            });
        }
    }
    debugBack() {
        const { txTrace } = this.props;
        if(txTrace.length > 0) {
            const index = this.state.indx > 0 ? this.state.indx-1 : 0;
            this.setState({ 
                indx: index, 
                debugObj: txTrace[index] 
            });
        }

    }
    public render() {
        const { indx, debugObj } = this.state;
        const { txTrace } = this.props;
        return (
            <div>
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            Transaction hash:
                            <input type="text" value={this.state.txHash} onChange={this.handleChange} />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
                {
                    indx >= 0 &&
                    <div>
                        <p>
                            <button className="input text-subtle" onClick={this.stopDebug}>Stop</button>
                        </p>
                        <div>
                            <p>OPCodes</p>
                            <pre>
                                <ul>
                                    { txTrace.map((obj: any, index: any) => {
                                        return <li key={index}>{obj.op}</li>
                                    }) }
                                </ul>
                            </pre>
                            <p>
                                <button className="input text-subtle" onClick={this.debugBack}>Step Back</button>
                                <button className="input text-subtle" onClick={this.debugInto}>Step Into</button>
                            </p>
                        </div>
                        <div>
                            <p>
                                <pre>
                                    <ul>
                                        {/* 
                                            // @ts-ignore */}
                                        {indx > 0 ? <li>gas cost:{debugObj.gasCost}</li>:<li>gas cost:</li>}
                                        {/* 
                                            // @ts-ignore */}
                                        <li>gas remaining:{debugObj.gas}</li>
                                    </ul>
                                </pre>
                            </p>
                            <p>
                                Memory:
                                <pre>
                                    {/* 
                                            // @ts-ignore */}
                                    {debugObj.memory}
                                </pre>
                            </p>
                            <p>
                                Stack:
                                <pre>
                                    {/* 
                                            // @ts-ignore */}
                                    {debugObj.stack}
                                </pre>
                            </p>
                            <p>
                                Storage:
                                <pre>
                                    {/* 
                                            // @ts-ignore */}
                                    {debugObj.storage}
                                </pre>
                            </p>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
export default DebugDisplay;