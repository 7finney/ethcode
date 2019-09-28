import React, { Component } from "react";
import "./ContractCompiled.css";

interface IProps {
  contractName: string;
  bytecode: any;
  abi: any;
}
class ContractCompiled extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
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
      </div>
    );
  }
}

export default ContractCompiled;
