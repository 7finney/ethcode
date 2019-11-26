import React, { Component } from "react";
import "./ContractDeploy.css";

interface IProps {
    contractName: string;
    bytecode: any;
    abi: any;
    vscode: any;
    compiled: any;
    error: Error | null;
}
interface IState {
    constructorInput: object[];
    gasSupply: number;
    inputABI: any;
    error: Error | null;
}

class ContractDeploy extends Component<IProps, IState> {
    public state: IState = {
        constructorInput: [],
        gasSupply: 1500000,
        inputABI: [],
        error: null
    };
    constructor(props: IProps, state: IState) {
        super(props);
        this.handleDeploy = this.handleDeploy.bind(this);
        this.handleGetGasEstimate = this.handleGetGasEstimate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.constructorInput = this.constructorInput.bind(this);    }

    componentDidMount() {
        const { abi } = this.props;
        for (var i in abi ) {
            if(abi[i].type == 'constructor' && abi[i].inputs.length > 0) {
                this.setState({ constructorInput: JSON.parse(JSON.stringify(abi[i].inputs)) });
                break;
            }
        }
    }
    componentDidUpdate(prevProps: any) {
        if(this.props.error !== prevProps.error) {
          const { error } = this.props;
          if(error) this.setState({ error });
        }
    }
    private handleDeploy() {
        const { vscode, bytecode, abi } = this.props;
        const { gasSupply, inputABI, constructorInput } = this.state;
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
    private constructorInput(event: any) {
        const { constructorInput } = this.state;
        const item = constructorInput[event.target.id];
        // @ts-ignore
        item['value'] = event.target.value;
        constructorInput[event.target.id] = item;
        this.setState({ constructorInput: constructorInput });
    }
    public render() {
        const { gasSupply, error, constructorInput } = this.state;
        
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
                                                <label>
                                                    {/* 
                                                        // @ts-ignore */}
                                                    {x.name}:
                                                    {/* 
                                                        // @ts-ignore */}
                                                    <input type={x.type} id={index} name={x.name} onChange={(e) => this.constructorInput(e)}/>
                                                </label>
                                            )
                                        })
                                    }
                                </div>
                            }
                        </div>
                        <label>
                            Gas Supply:
                            <input type="number" value={gasSupply} id="deployGas" onChange={(e) => this.handleChange(e)}/>
                        </label>
                        <input type="submit" value="Deploy" />
                    </form>
                    <form onSubmit={this.handleGetGasEstimate}>
                        <input type="submit" value="Get gas estimate" />
                    </form>
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