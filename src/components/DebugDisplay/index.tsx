import React, { Component } from "react";
import "./DebugDisplay.css";

interface IProps {
    vscode: any;
    txTrace: any;
    deployedResult: object;
}
interface IState {
    txHash: string | null;
    debugObj: object;
    indx: any;
    deployedResult: object
}
// @ts-ignore
// const vscode = acquireVsCodeApi(); // eslint-disable-line

class DebugDisplay extends Component<IProps, IState> {
    public state = {
        txHash: '',
        debugObj: {},
        indx: -1,
        deployedResult: {}
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
        console.log("outside")
        const { deployedResult } = this.props
        // @ts-ignore
        console.dir(deployedResult['transactionHash']);
        // if(deployedResult) {
        //     console.log("inside");
        //     this.setState({
        //         txHash: this.props.deployedResult.transactionHash
        //     })
        // }
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
        const index = (this.state.indx < txTrace.length-1) ?
        this.state.indx+1 : 
        txTrace.length-1;
        if(txTrace.length > 0) {
            this.setState({ 
                indx: index, 
                debugObj: txTrace[index] 
            });
        }
    }
    debugBack() {
        const { txTrace } = this.props;
        const index = this.state.indx > 0 ? this.state.indx-1 : 0;
        if(txTrace.length > 0) {
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
            <div className="container">
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            <span style={{ marginRight: '5px' }}>Transaction hash:</span>
                            <input type="text" value={this.state.txHash} onChange={this.handleChange} />
                        </label>
                        <input type="submit" value="Debug" />
                    </form>
                </div>
                {
                    indx >= 0 &&
                    <div>
                        <p>
                            <button className="input text-subtle" onClick={this.stopDebug}>Stop</button>
                        </p>
                        <div>
                            <p>OPCodes:</p>
                            <div>
                                <ul className="opDiv">
                                    { txTrace.map((obj: any, index: any) => {
                                        if (index === indx)
                                            return <li className="selected" key={index} id={index}>{obj.op}</li>;
                                        else 
                                            return <li key={index} id={index}>{obj.op}</li>;
                                    }) }
                                </ul>
                            </div>
                            <div>
                                <p>
                                    <button onClick={this.debugBack}>Step Back</button>
                                    <button onClick={this.debugInto}>Step Into</button>
                                </p>
                            </div>
                        </div>
                        <div>
                            <div className="opDiv">
                                <p>
                                    <ul>
                                        {/* 
                                            // @ts-ignore */}
                                        {indx > 0 ? <li>gas cost:{debugObj.gasCost}</li>:<li>gas cost:</li>}
                                        {/* 
                                            // @ts-ignore */}
                                        <li>gas remaining:{debugObj.gas}</li>
                                    </ul>
                                </p>
                            </div>
                            <div>
                                <div className="row">
                                    <div className="title">
                                        Memory:
                                    </div>
                                    <div>
                                        <div className="value">
                                            {/* 
                                                    // @ts-ignore */}
                                            {JSON.stringify(debugObj.memory)}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="title">
                                        Stack:
                                    </div>
                                    <div>
                                        <div className="value">
                                            {/* 
                                                    // @ts-ignore */}
                                            {JSON.stringify(debugObj.stack)}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="title">
                                        Storage:
                                    </div>
                                    <div>
                                        <div className="value">
                                            {/* 
                                                    // @ts-ignore */}
                                            {JSON.stringify(debugObj.storage)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
export default DebugDisplay;