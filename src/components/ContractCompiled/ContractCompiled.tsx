// @ts-ignore
import React, { Component } from "react";
import "./ContractCompiled.css";

interface IProps {
  contractName: string;
  bytecode: any;
  abi: any;
}
class ContractCompiled extends Component<IProps> {
<<<<<<< HEAD
    constructor(props: IProps) {
        super(props);
    }
    public _handleInput() {
        console.log("Will handle input");
    }
    public render() {
        const { contractName, bytecode, abi } = this.props;
        return(
            <div>
                <span className="contract-name inline-block highlight-success">Contract Name: { contractName }</span>
                <div className="byte-code">
                    <pre className="large-code">{ JSON.stringify(bytecode) }</pre>
                </div>
                <div className="abi-definition">
                    <pre className="large-code">{ JSON.stringify(abi) }</pre>
                </div>
            </div>
        );
    }
=======
  constructor(props: IProps) {
    super(props);
  }
  public _handleInput() {
    console.log("Will handle input");
  }
  public render() {
    const { contractName, bytecode, abi } = this.props;
    return (
      <div>
        <span className="contract-name inline-block highlight-success">
          {contractName}
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
>>>>>>> e072683b85489fb5e8069276b5d053a4b87b3d44
}

export default ContractCompiled;
