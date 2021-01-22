import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalStore } from 'types';
import './ContractCompiled.css';

interface IProps {
  contractName: string;
  fileName: string;
}

const ContractCompiled = (props: IProps) => {
  const { contractName, fileName } = props;
  const [error] = useState(null);
  const { bytecode, abi } = useSelector((state: GlobalStore) => ({
    bytecode: state.contractsStore.compiledResult?.contracts[fileName][contractName].evm.bytecode.object,
    abi: state.contractsStore.compiledResult?.contracts[fileName][contractName].abi,
  }));
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
