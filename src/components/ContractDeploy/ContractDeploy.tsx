import React, { Component } from "react";
import "./ContractDeploy.css";
import JSONPretty from 'react-json-pretty';

interface IProps {
    contractName: string;
    bytecode: any;
    abi: any;
    vscode: any;
    compiled: any;
    error: Error | null;
    gasEstimate: number;
    deployedResult: object;
}
interface IState {
    constructorInput: object[];
    gasSupply: number;
    error: Error | null;
    deployed: object;
}

class ContractDeploy extends Component<IProps, IState> {
    public state: IState = {
        constructorInput: [],
        gasSupply: 0,
        error: null,
        deployed: {}
    };
    constructor(props: IProps, state: IState) {
        super(props);
        this.handleDeploy = this.handleDeploy.bind(this);
        this.handleGetGasEstimate = this.handleGetGasEstimate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleConstructorInputChange = this.handleConstructorInputChange.bind(this);    }

    componentDidMount() {
        const { abi } = this.props;
        for (var i in abi ) {
            if(abi[i].type === 'constructor' && abi[i].inputs.length > 0) {
                this.setState({ constructorInput: JSON.parse(JSON.stringify(abi[i].inputs)) });
                break;
            }
        }
    }
    componentDidUpdate(prevProps: any) {
        const { gasEstimate, deployedResult, error } = this.props;
        if(error !== prevProps.error) {
            this.setState({ error: error });
        }
        else if(deployedResult !== prevProps.deployedResult) {
            this.setState({ deployed: deployedResult });
        }
        else if((this.state.gasSupply === 0 && gasEstimate !== this.state.gasSupply) || gasEstimate !== prevProps.gasEstimate) {
            this.setState({ gasSupply: gasEstimate });
        }

    }
    private handleDeploy() {
        const { vscode, bytecode, abi } = this.props;
        const { gasSupply, constructorInput } = this.state;
        this.setState({ error: null });
        vscode.postMessage({
          command: "run-deploy",
          payload: {
                abi,
                bytecode,
                params: constructorInput,
                gasSupply
            }
        });
    }
    private handleGetGasEstimate() {
        const { vscode, bytecode, abi } = this.props;
        const { constructorInput } = this.state;
        try {
          vscode.postMessage({
            command: "run-get-gas-estimate",
            payload: {
              abi,
              bytecode,
              params: constructorInput
            }
          });
        } catch (err) {
          this.setState({ error: err });
        }
    }
    private handleChange(event: any) {
        this.setState({ gasSupply: event.target.value });
    }
    private handleConstructorInputChange(event: any) {
        const { constructorInput } = this.state;
        const item = constructorInput[event.target.id];
        // @ts-ignore
        item['value'] = event.target.value;
        constructorInput[event.target.id] = item;
        this.setState({ constructorInput });
    }
    public render() {
        const { gasSupply, error, constructorInput, deployed } = this.state;
        return(
            <div>
                <div>
                    <form onSubmit={this.handleDeploy}>
                        <div className="form-container">
                            {
                                (constructorInput && constructorInput.length > 0) && 
                                <div>
                                    {
                                        constructorInput.map((x: object, index) => {
                                            return(
                                                <div className="constructorInput">
                                                    {/* 
                                                        // @ts-ignore */}
                                                    <label className="label_name">{x.name}:</label>
                                                    {/* 
                                                        // @ts-ignore */}
                                                    <input className="input" type={x.type} placeholder={x.type} id={index} name={x.name} onChange={(e) => this.handleConstructorInputChange(e)}/>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            }
                        </div>
                        <div className="gas_supply">
                            <label className="label_name">Gas Supply:</label>
                            {
                                (gasSupply > 0) ?
                                <input type="number" className="input" value={gasSupply} id="deployGas" onChange={(e) => this.handleChange(e)}/> :
                                <input type="number" className="input" value="" id="deployGas" onChange={(e) => this.handleChange(e)}/>
                            }
                        </div>
                        <div className="button_group">
                            <input type="submit" value="Deploy" />
                        </div>
                    </form>
                    <div className="button_group">
                        <form onSubmit={this.handleGetGasEstimate}>
                            <input type="submit" value="Get gas estimate" />
                        </form>
                    </div>
                </div>
                <div className="error_message">
                    {
                        Object.entries(deployed).length !== 0 &&
                        <div>
                            <span className="contract-name inline-block highlight-success">
                                Transaction Receipt:
                            </span>
                            <div>
                                <pre className="large-code">
                                    <JSONPretty id="json-pretty" data={deployed}></JSONPretty>
                                    {/* {deployed} */}
                                </pre>
                            </div>
                        </div>
                    }
                </div>
                <div className="error_message">
                {
                    error &&
                    <div>
                        <span className="contract-name inline-block highlight-success">
                            Error Message:
                        </span>
                        <div>
                            <pre className="large-code-error">{JSON.stringify(error)}</pre>
                        </div>
                    </div>
                }
                </div>
            </div>
        );
    }
}

export default ContractDeploy;