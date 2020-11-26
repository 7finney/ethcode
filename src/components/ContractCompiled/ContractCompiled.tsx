import React, { useState } from "react";
import { ABIDescription } from "types";
import "./ContractCompiled.css";

interface IProps {
  contractName: string;
  bytecode: string;
  abi: ABIDescription[];
}

const ContractCompiled = (props: IProps) => {
  const { contractName, bytecode, abi } = props;
  const [error] = useState(null);
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
};

export default ContractCompiled;
