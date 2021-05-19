import { IFileSelectorItem, CompilationResult, CompiledContract } from './types';

export const getFiles = (compiled: CompilationResult): Array<string> => {
  return Object.keys(compiled.contracts);
};

export const getContracts = (json: CompilationResult, fileName: string): Array<CompiledContract> => {
  const type = 'standard-json';
  return [];
  // if (type === 'standard-json') {
  //   const ctks = Object.keys(json.contracts);
  //   for (let i = 0; i < ctks.length; i++) {
  //     const activeContractsKey = ctks[i];
  //     if (activeContractsKey === fileName) {
  //       const contractFileKeys = Object.keys(json.contracts[activeContractsKey]);
  //       return contractFileKeys;
  //     }
  //   }
  // }
};

export const extractFileSelectorOptions = (optionsArray: Array<string>): Array<IFileSelectorItem> => {
  const options: Array<IFileSelectorItem> = [];
  optionsArray.map((file) => {
    const optItm: IFileSelectorItem = {
      value: file,
      label: file.substring(file.lastIndexOf('/') + 1),
    };
    return options.push(optItm);
  });
  return options;
};

function decodeJSON(json: CompilationResult, type: string) {
  if (type === 'combined-json') {
    const contractsKeys = Object.keys(json.contracts);
    for (let i = 0; i < contractsKeys.length; i++) {
      const activeContractsKey = contractsKeys[i];
      const activeContractItem = json.contracts[activeContractsKey];
      const { abi, bin } = activeContractItem;
      console.log(abi);
      console.log(bin);
    }
  }
  if (type === 'standard-json') {
    const contractsKeys = Object.keys(json.contracts);
    for (let i = 0; i < contractsKeys.length; i++) {
      const activeContractsKey = contractsKeys[i];
      const contractFileKeys = Object.keys(json.contracts[activeContractsKey]);
      for (let j = 0; j < contractFileKeys.length; j++) {
        const activeContractFileKey = contractFileKeys[j];
        const activeContractFileItem = json.contracts[activeContractsKey][activeContractFileKey];
        const { abi, evm } = activeContractFileItem;
        console.log(abi);
        console.log(evm.bytecode.object);
      }
    }
  }
}
