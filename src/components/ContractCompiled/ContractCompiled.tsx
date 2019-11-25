import React, { Component } from "react";
import "./ContractCompiled.css";

interface IProps {
  contractName: string;
  bytecode: any;
  abi: any;
  vscode: any;
  compiled: any;
  errors: any;
}
interface IState {
  gasSupply: number;
  errors: any
}
class ContractCompiled extends Component<IProps, IState> {
  public state: IState = {
    gasSupply: 1500000,
    errors: undefined
  };
  constructor(props: IProps, state: IState) {
    super(props);
    this.handleDeploy = this.handleDeploy.bind(this);
  }
  
  public handleDeploy() {
    const { vscode, bytecode, abi } = this.props;
    const { gasSupply } = this.state;
    vscode.postMessage({
      command: "run-deploy",
      payload: {
        abi,
        bytecode,
        gasSupply
      }
    });
  }
  componentDidUpdate(prevProps: any) {
    if(this.props.errors !== prevProps.errors) {
      const { errors } = this.props;
      if(this.props.errors) this.setState({ errors: errors });
    }
  }

  handleChange(event: any) {
    this.setState({ gasSupply: event.target.value });
  }
  
  public render() {
    const { contractName, bytecode, abi } = this.props;
    const { gasSupply, errors } = this.state;
    return (
      <div>
        <span className="contract-name inline-block highlight-success">
          Contract Name: {contractName}
        </span>

        <div className="byte-code">
          <pre className="large-code">{JSON.stringify(bytecode)}</pre>
        </div>
        <div className="abi-definition">
          <pre className="large-code">{JSON.stringify(abi)}</pre>
        </div>
        <div>
          <form onSubmit={this.handleDeploy}>
            <label>
              Gas Supply:
              <input type="number" value={gasSupply} id="deployGas" onChange={(e) => this.handleChange(e)}/>
            </label>
            <input type="submit" value="Deploy" />
          </form>
        </div>
        <div>
          {
            errors &&
            <div>
              <pre>{JSON.stringify(errors)}</pre>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default ContractCompiled;
