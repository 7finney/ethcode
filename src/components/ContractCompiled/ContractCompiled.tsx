import React, { Component } from "react";
import "./ContractCompiled.css";

interface IProps {
  contractName: string;
  bytecode: any;
  abi: any;
  vscode: any;
}
class ContractCompiled extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
    this.handleDeploy = this.handleDeploy.bind(this);
  }
  
  private handleDeploy() {
    const { vscode, bytecode, abi } = this.props;
    vscode.postMessage({
      command: "run-deploy",
      payload: {
        abi,
        bytecode,
        gasSupply: 1500000
      }
    });
  }
  
  public render() {
    const { contractName, bytecode, abi } = this.props;
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
            <input type="submit" value="Deploy" />
          </form>
        </div>
      </div>
    );
  }
}

export default ContractCompiled;
