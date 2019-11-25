import React, { Component } from "react";
import "./ContractCompiled.css";

interface IProps {
  contractName: string;
  bytecode: any;
  abi: any;
  vscode: any;
}
interface IState {
  gasSupply: number;
  errors: any
}
class ContractCompiled extends Component<IProps, IState> {
  public state: IState = {
    gasSupply: 1500000,
    errors: null
  };
  constructor(props: IProps, state: IState) {
    super(props);
    this.handleDeploy = this.handleDeploy.bind(this);
    this.handleGetGasEstimate = this.handleGetGasEstimate.bind(this);
  }
  
  private handleDeploy() {
    const { vscode, bytecode, abi } = this.props;
    const { gasSupply } = this.state;
    try {
      vscode.postMessage({
        command: "run-deploy",
        payload: {
          abi,
          bytecode,
          gasSupply
        }
      });
    } catch (err) {
      this.setState({ errors: err });
    }
  }

  private handleGetGasEstimate() {
    const { vscode, bytecode, abi } = this.props;
    try {
      vscode.postMessage({
        command: "run-get-gas-estimate",
        payload: {
          abi,
          bytecode
        }
      });
    } catch (err) {
      this.setState({ errors: err });
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
          <form onSubmit={this.handleGetGasEstimate}>
            <input type="submit" value="Get gas estimate" />
          </form>
        </div>
        <div>
          {
            errors &&
            <div>
              {errors}
            </div>
          }
        </div>
      </div>
    );
  }
}

export default ContractCompiled;
