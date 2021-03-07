import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalStore } from 'types';
import './ContractCompiled.css';

const ContractCompiled = () => {
  const [error] = useState(null);
  const { bytecode, abi, contractName } = useSelector((state: GlobalStore) => ({
    bytecode:
      state.contractsStore.compiledResult?.contracts[state.contractsStore.activeFileName][
        state.contractsStore.activeContractName
      ]?.evm.bytecode.object,
    abi:
      state.contractsStore.compiledResult?.contracts[state.contractsStore.activeFileName][
        state.contractsStore.activeContractName
      ]?.abi,
    contractName: state.contractsStore.activeContractName,
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
