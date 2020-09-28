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
  error: Error | null;
}

class ContractCompiled extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      error: null,
    };
  }

  public render() {
    const { contractName, bytecode, abi } = this.props;
    const { error } = this.state;
    return (
      <div>
        <span className="contract-name inline-block highlight-success">Contract Name: {contractName}</span>
        <div className="byte-code">
          <pre className="large-code">{JSON.stringify(bytecode)}</pre>
        </div>
        <div className="abi-definition">
          <pre className="large-code">{JSON.stringify(abi)}</pre>
        </div>
        <div>{error && <div>{error}</div>}</div>
      </div>
    );
  }
}

export default ContractCompiled;
