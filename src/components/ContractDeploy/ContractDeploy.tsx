import React, { Component } from "react";
import "./ContractDeploy.css";

interface IProps {
    contractName: string;
    bytecode: any;
    abi: any;
    vscode: any;
    compiled: any;
    errors: any;
}
interface IState {
    constructorInput: object[];
    gasSupply: number;
    inputABI: any;
    errors: any;
}

class ContractDeploy extends Component<IProps, IState> {
    public state: IState = {
        constructorInput: [],
        gasSupply: 1500000,
        inputABI: [],
        errors: undefined
    };
    constructor(props: IProps, state: IState) {
        super(props);
        this.handleDeploy = this.handleDeploy.bind(this);
    }

    componentDidMount() {
        const { abi } = this.props;
        for (var i in abi ) {
            if(abi[i].type == 'constructor' && abi[i].inputs.length>0) {
                this.setState({ constructorInput: abi[i].inputs, inputABI: abi });
                break;
            }
        }
    }
    componentDidUpdate(prevProps: any) {
        if(this.props.errors !== prevProps.errors) {
          const { errors } = this.props;
          if(errors) this.setState({ errors: errors });
        }
    }
    public handleDeploy() {
        const { vscode, bytecode } = this.props;
        const { gasSupply, inputABI, constructorInput } = this.state;
        for (var i in inputABI ) {
            if(inputABI[i].type == 'constructor' && inputABI[i].inputs.length>0) {
                inputABI[i].inputs = constructorInput;
                break;
            }
        }        
        vscode.postMessage({
          command: "run-deploy",
          payload: {
                abi: inputABI,
                bytecode,
                gasSupply
            }
        });
    }
    handleChange(event: any) {
        this.setState({ gasSupply: event.target.value });
    }
    constructorInput(event: any) {
        const { constructorInput } = this.state;
        const item = constructorInput[event.target.id];
        // @ts-ignore
        item['value'] = event.target.value;
        constructorInput[event.target.id] = item;
        this.setState({ constructorInput: constructorInput });
    }
    public render() {
        const { gasSupply, errors, constructorInput } = this.state;
        
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
                </div>
                <div className="error_message">
                {
                    errors &&
                    <div>
                        <span className="contract-name inline-block highlight-success">
                            Error Message:
                        </span>
                        <div>
                            <pre className="large-code-error">{JSON.stringify(errors)}</pre>
                        </div>
                    </div>
                }
                </div>
            </div>
        );
    }
}

export default ContractDeploy;