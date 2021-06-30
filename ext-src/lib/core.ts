import { window, ExtensionContext } from 'vscode';

import Logger from '../utils/logger';
import {
  StandardJSONOutput,
  IStandardJSONContractsQP,
  StandardCompiledContract,
  isStdContract,
  CombinedJSONOutput,
  isComContract,
  ICombinedJSONContractsQP,
  CombinedCompiledContract,
} from '../types';

// Create logger
const logger = new Logger();

// Parse Standard JSON payload
export function parseJSONPayload(context: ExtensionContext, _jsonPayload: any): void {
  try {
    const { contracts }: StandardJSONOutput = JSON.parse(_jsonPayload);
    const quickPick = window.createQuickPick<IStandardJSONContractsQP>();
    quickPick.items = Object.keys(contracts).map((contract) => ({ label: contract, contractKey: contract }));
    quickPick.placeholder = 'Select contract file';
    quickPick.onDidChangeActive((selection: Array<IStandardJSONContractsQP>) => {
      quickPick.value = selection[0].label;
    });
    quickPick.onDidChangeSelection((selection: Array<IStandardJSONContractsQP>) => {
      if (selection[0]) {
        const contractFileName = selection[0].contractKey;
        const contractFile = contracts[contractFileName];
        if (!isStdContract(contractFile)) {
          const contractQp = window.createQuickPick<IStandardJSONContractsQP>();
          contractQp.items = Object.keys(contractFile).map((contract) => ({
            label: contract,
            contractKey: contract,
          }));
          contractQp.placeholder = 'Select contract';
          contractQp.onDidChangeActive((selection: Array<IStandardJSONContractsQP>) => {
            contractQp.value = selection[0].label;
          });
          contractQp.onDidChangeSelection((selection: Array<IStandardJSONContractsQP>) => {
            if (selection[0]) {
              const contract: StandardCompiledContract = contracts[contractFileName][selection[0].contractKey];
              if (isStdContract(contract)) {
                context.workspaceState.update('contract', contract);
                logger.success('Contract loaded!');
              } else {
                logger.error(Error('Could not parse contract.'));
              }
              contractQp.dispose();
            }
          });
          contractQp.onDidHide(() => contractQp.dispose());
          contractQp.show();
        } else {
          logger.error(Error('Could not parse contract.'));
        }
        quickPick.dispose();
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  } catch (error) {
    logger.error(
      Error(
        'Could not load JSON file. Make sure it follows Solidity output description. Know more: https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-input-and-output-json-description.'
      )
    );
  }
}

// Parse Combined JSON payload
export function parseCombinedJSONPayload(context: ExtensionContext, _jsonPayload: any): void {
  if (_jsonPayload) {
    const { contracts }: CombinedJSONOutput = JSON.parse(_jsonPayload);
    const quickPick = window.createQuickPick<ICombinedJSONContractsQP>();
    quickPick.items = Object.keys(contracts).map((contract) => ({ label: contract, contractKey: contract }));
    quickPick.placeholder = 'Select contract';
    quickPick.onDidChangeActive((selection: Array<ICombinedJSONContractsQP>) => {
      quickPick.value = selection[0].label;
    });
    quickPick.onDidChangeSelection((selection: Array<ICombinedJSONContractsQP>) => {
      if (selection[0]) {
        const contract: CombinedCompiledContract = contracts[selection[0].contractKey];
        if (isComContract(contract)) {
          context.workspaceState.update('contract', contract);
          logger.success('Contract loaded!');
        } else {
          logger.error(Error('Could not parse contract.'));
        }
        quickPick.dispose();
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  } else {
    logger.error(
      Error(
        'Could not load JSON file. Make sure it follows Solidity output description. Know more: https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-input-and-output-json-description.'
      )
    );
  }
}
