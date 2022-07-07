import * as vscode from 'vscode'
import { window, workspace } from 'vscode'
import * as fs from 'fs';
import * as path from 'path';
import { JsonFragment } from '@ethersproject/abi';

import { CompiledJSONOutput, ConstructorInputValue, getAbi, IFunctionQP } from '../types'
import { logger } from '../lib';
import { errors } from '../config';
import { createDeployedFile, writeConstructor, writeFunction } from '../lib/file';

const createDeployed = (contract: CompiledJSONOutput) => {
  const fullPath = getDeployedFullPath(contract);
  if (fs.existsSync(fullPath)) {
    logger.success("Functions input file already exists, remove it to add a empty file");
    return;
  }

  if (contract === undefined || contract == null || workspace.workspaceFolders === undefined) {
    logger.error(errors.ContractNotFound);
    return;
  }

  const input = {
    address: "",
    commit: "<git-commit>"
  }

  createDeployedFile(getDeployedFullPath(contract), contract, input);
}

const createFunctionInput = (contract: CompiledJSONOutput) => {
  const fullPath = getFunctionInputFullPath(contract);
  if (fs.existsSync(fullPath)) {
    logger.success("Functions input file already exists, remove it to add a empty file");
    return;
  }

  if (contract === undefined || contract == null || workspace.workspaceFolders === undefined) {
    logger.error(errors.ContractNotFound);
    return;
  }

  const functionsAbi = getAbi(contract)?.filter((i: JsonFragment) => i.type === 'function');
  if (functionsAbi === undefined || functionsAbi.length === 0) {
    logger.error("This contract doesn't have any function");
    return;
  }

  const functions = functionsAbi
    .map(e => (
      {
        name: e.name,
        stateMutability: e.stateMutability,
        inputs: e.inputs?.map(
          c => ({ ...c, value: '' })
        )
      }));

  writeFunction(getFunctionInputFullPath(contract), contract, functions);
}

const getDeployedFullPath = (contract: CompiledJSONOutput) => {
  if (contract.path == undefined) {
    throw new Error("Contract Path is empty.");
  }

  return path.join(contract.path, `${contract.name}_deployed_address.json`);
}

const getFunctionInputFullPath = (contract: CompiledJSONOutput) => {
  if (contract.path == undefined) {
    throw new Error("Contract Path is empty.");
  }

  return path.join(contract.path, `${contract.name}_functions_input.json`);
}

const getConstructorInputFullPath = (contract: CompiledJSONOutput) => {
  if (contract.path == undefined) {
    throw new Error("Contract Path is empty.");
  }

  return path.join(contract.path, `${contract.name}_constructor_input.json`);
}

const getDeployedInputs = (context: vscode.ExtensionContext) => {
  try {
    const contract = context.workspaceState.get('contract') as CompiledJSONOutput;
    const fullPath = getDeployedFullPath(contract);
    let inputs = fs.readFileSync(fullPath).toString();
    return JSON.parse(inputs);
  } catch (e) {
    return undefined;
  }
}

const getConstructorInputs = (context: vscode.ExtensionContext) => {
  try {
    const contract = context.workspaceState.get('contract') as CompiledJSONOutput;
    const fullPath = getConstructorInputFullPath(contract);
    let inputs = fs.readFileSync(fullPath).toString();

    const constructorInputs: Array<ConstructorInputValue> = JSON.parse(inputs);
    return constructorInputs.map(e => e.value); // flattened parameters of input
  } catch (e) {
    return [];
  }
}

const getFunctionInputs = async (context: vscode.ExtensionContext): Promise<JsonFragment> => {
  return new Promise((resolve, reject) => {
    try {
      const contract = context.workspaceState.get('contract') as CompiledJSONOutput;
      const fullPath = getFunctionInputFullPath(contract);
      let inputs = fs.readFileSync(fullPath).toString();

      const functions: Array<JsonFragment> = JSON.parse(inputs);

      const quickPick = window.createQuickPick<IFunctionQP>();
      quickPick.items = functions.map((f) => ({
        label: f.name || '',
        functionKey: f.name || '',
      }));
      quickPick.placeholder = 'Select function';
      quickPick.onDidChangeSelection((selection: Array<IFunctionQP>) => {
        if (selection[0] && workspace.workspaceFolders) {
          const { functionKey } = selection[0];
          quickPick.dispose();
          const abiItem = functions.filter((i: JsonFragment) => i.name === functionKey);
          if (abiItem.length === 0)
            throw new Error('No function is selected');
          resolve(abiItem[0]);
        }
      });
      quickPick.onDidHide(() => { quickPick.dispose(); });
      quickPick.show();
    } catch (err) {
      reject(err);
    }
  });
}

const shouldCreateFile = (contract: CompiledJSONOutput) => {
  const fullPath = getConstructorInputFullPath(contract);
  if (fs.existsSync(fullPath)) {
    return false;
  }
  return true;
}

const createConstructorInput = (contract: CompiledJSONOutput) => {
  if (!shouldCreateFile(contract)) {
    logger.success("Constructor file already exists, remove it to add a empty file");
    return;
  }
  if (contract === undefined || contract == null || workspace.workspaceFolders === undefined) {
    logger.error(errors.ContractNotFound);
    return;
  }

  const constructor = getAbi(contract)?.filter((i: JsonFragment) => i.type === 'constructor');
  if (constructor === undefined) {
    logger.log("Abi doesn't exist on the loaded contract");
    return;
  }

  if (constructor.length === 0) {
    logger.log("This abi doesn't have any constructor");
    return;
  }

  const constInps = constructor[0].inputs;
  if (!constInps || constInps.length == 0) {
    logger.log("The constructor have no parameters");
    return;
  }

  const inputs: Array<ConstructorInputValue> = constInps.map(
    (inp) => <ConstructorInputValue>{ ...inp, value: '' }
  );

  writeConstructor(getConstructorInputFullPath(contract), contract, inputs);
}

export {
  createFunctionInput,
  createDeployed,
  createConstructorInput,
  getConstructorInputs,
  getFunctionInputs,
  getDeployedInputs
}