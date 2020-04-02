import React, { Component } from "react";
import ReactDiffViewer from 'react-diff-viewer';
import "./DebugDisplay.css";

interface IProps {
    vscode: any;
    txTrace: any;
    deployedResult: string;
    testNetId: string;
    traceError: string;
}
interface IState {
    txHash: string | null;
    debugObj: object;
    olddebugObj: object;
    newdebugObj: object;
    indx: any;
    deployedResult: string;
    testNetId: string;
    disable: boolean;
    traceError: string;
}

class DebugDisplay extends Component<IProps, IState> {
    public state = {
        txHash: '',
        debugObj: {},
        olddebugObj: {},
        newdebugObj: {},
        indx: -1,
        deployedResult: "",
        testNetId: "",
        disable: false,
        traceError: ''
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
        event.preventDefault();
        const { txHash, testNetId } = this.state;

        this.setState({
            indx: -1,
            disable: true,
            newdebugObj: {},
            olddebugObj: {},
            traceError: ''
        }, () => {
            // get tx from txHash & debug transaction
            this.props.vscode.postMessage({
                command: "debugTransaction",
                txHash,
                testNetId
            });
        });
    }

    componentDidMount() {
        this.setState({ testNetId: this.props.testNetId });
    }

    componentDidUpdate(prevProps: IProps, prevState: IState) {
        const { newdebugObj } = this.state;

        if (this.props.traceError !== this.state.traceError && prevState.traceError !== this.props.traceError) {
            this.setState({
                disable: false,
                traceError: this.props.traceError
            });
        }
        if (this.props.txTrace !== prevProps.txTrace) {
            this.setState({
                indx: 0,
                olddebugObj: newdebugObj,
                newdebugObj: this.props.txTrace[0],
                disable: false,
                traceError: ''
            });
        }
        if (this.props.testNetId !== this.state.testNetId) {
            this.setState({
                testNetId: this.props.testNetId
            });
        }
    }
    handleChange(event: any) {
        this.setState({ txHash: event.target.value });
    }
    stopDebug() {
        this.setState({
            disable: false,
            indx: -1,
            debugObj: {},
            traceError: ''
        });
    }
    debugInto() {
        const { newdebugObj } = this.state;
        const { txTrace } = this.props;
        const index = (this.state.indx < txTrace.length - 1) ?
            this.state.indx + 1 :
            txTrace.length - 1;
        if (txTrace.length > 0) {
            this.setState({
                indx: index,
                newdebugObj: txTrace[index],
                olddebugObj: newdebugObj
            });
        }
    }
    debugBack() {
        const { txTrace } = this.props;
        const index = this.state.indx > 0 ? this.state.indx - 1 : 0;
        if (txTrace.length > 0) {
            this.setState({
                indx: index,
                newdebugObj: txTrace[index],
                olddebugObj: txTrace[index - 1]
            });
        }

    }
    public render() {
        const { indx, olddebugObj, newdebugObj, disable, traceError } = this.state;
        const { txTrace } = this.props;

        return (
            <div className="container">
                <div>
                    <form onSubmit={this.handleSubmit}>
                        <label>
                            <span style={{ marginRight: '5px' }}>Transaction hash:</span>
                            <input type="text" className="custom_input_css" value={this.state.txHash} onChange={this.handleChange} />
                        </label>
                        <input type="submit" disabled={disable} className={(disable ? 'custom_button_css button_disable' : 'custom_button_css')} style={{ marginLeft: '10px' }} value="Debug" />
                    </form>
                    <p>
                        <button className="text-subtle custom_button_css" onClick={this.stopDebug}>Stop</button>
                    </p>
                </div>
                {
                    indx >= 0 &&
                    <div>
                        <div>
                            <p>OPCodes:</p>
                            <div>
                                <ul className="opDiv" style={{ paddingLeft: 0 }}>
                                    {txTrace.map((obj: any, index: any) => {
                                        return <li className={index === indx ? "selected" : ""} key={index} id={index}>{obj.op}</li>;
                                    })}
                                </ul>
                            </div>
                            <div>
                                <p>
                                    <button className="custom_button_css" style={{ marginRight: "20px" }} onClick={this.debugBack}>Step Back</button>
                                    <button className="custom_button_css" onClick={this.debugInto}>Step Into</button>
                                </p>
                            </div>
                        </div>
                        {/* TODO */}
                        <div style={{ width: "100%", overflowX: "scroll", overflowY: "hidden" }}>
                            <ReactDiffViewer
                                oldValue={JSON.stringify(olddebugObj, null, "\t")}
                                newValue={JSON.stringify(newdebugObj, null, "\t")}
                                disableWordDiff={true}
                                hideLineNumbers={true}
                            />
                        </div>
                    </div>
                }
                {
                    <div className="error_message">
                        {
                            traceError &&
                            <div>
                                <span className="contract-name inline-block highlight-success">Error Message:</span>
                                <div>
                                    <pre className="large-code-error">{JSON.stringify(traceError)}</pre>
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>
        );
    }
}
export default DebugDisplay;