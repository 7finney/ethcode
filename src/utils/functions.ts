import * as vscode from 'vscode'
import { window, workspace } from 'vscode'
import * as fs from 'fs';
import * as path from 'path';
import { JsonFragment } from '@ethersproject/abi';

import { CompiledJSONOutput, ConstructorInputValue, getAbi, IFunctionQP } from '../types'
import { logger } from '../lib';
import { errors } from '../config';
import { writeConstructor, writeFunction } from '../lib/file';

const createFunctionInput = (context: vscode.ExtensionContext) => {
  const contract = context.workspaceState.get('contract') as CompiledJSONOutput;

  const quickPick = window.createQuickPick<IFunctionQP>();
  if (contract) {
    const functions = getAbi(contract)?.filter((i: JsonFragment) => i.type === 'constructor');
    if (functions === undefined) {
      logger.log("Abi doesn't exist on the loaded contract");
      return;
    }

    if (functions.length === 0) {
      logger.log("This abi doesn't have any constructor");
      return;
    }

    quickPick.items = functions.map((f) => ({
      label: f.name || '',
      functionKey: f.name || '',
    }));
    quickPick.placeholder = 'Select function';
    quickPick.onDidChangeActive((selection: Array<IFunctionQP>) => {
      quickPick.value = selection[0].label;
    });
    quickPick.onDidChangeSelection((selection: Array<IFunctionQP>) => {
      if (selection[0] && workspace.workspaceFolders) {
        const { functionKey } = selection[0];
        quickPick.dispose();
        const abiItem = functions.filter((i: JsonFragment) => i.name === functionKey);
        writeFunction(workspace.workspaceFolders[0].uri.path, abiItem);
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  } else {
    logger.error(errors.ContractNotFound);
  }
}

const getConstructorInputFullPath = (contract: CompiledJSONOutput) => {
  if (contract.path == undefined) {
    throw new Error("Contract Path is empty.");
  }

  return path.join(contract.path, `${contract.name}_constructor_input.json`);
}

const getConstructorInputs = (context: vscode.ExtensionContext) => {
  try {
    const contract = context.workspaceState.get('contract') as CompiledJSONOutput;
    const fullPath = getConstructorInputFullPath(contract);
    let inputs = fs.readFileSync(fullPath).toString();

    logger.log("parameters");
    logger.log(fullPath);
    logger.log(JSON.stringify(inputs));


    const constructorInputs: Array<ConstructorInputValue> = JSON.parse(inputs);
    return constructorInputs.map(e => e.value); // flattened parameters of input
  } catch (e) {
    logger.log(e);
    return [];
  }
}

const createConstructorInput = (context: vscode.ExtensionContext) => {
  const contract = context.workspaceState.get('contract') as CompiledJSONOutput;

  if (contract === undefined || contract == null || workspace.workspaceFolders === undefined) {
    logger.error(errors.ContractNotFound);
    return;
  }

  const constructor = getAbi(contract)?.filter((i: JsonFragment) => i.type === 'constructor');
  if (constructor === undefined) {
    logger.error("Abi doesn't exist on the loaded contract");
    return;
  }

  if (constructor.length === 0) {
    logger.error("This abi doesn't have any constructor");
    return;
  }

  const constInps = constructor[0].inputs;
  if (!constInps || constInps.length == 0) {
    logger.error("The constructor have no parameters");
    return;
  }

  const inputs: Array<ConstructorInputValue> = constInps.map(
    (inp) => <ConstructorInputValue>{ ...inp, value: '' }
  );

  writeConstructor(getConstructorInputFullPath(contract), contract, inputs);
}

export {
  createFunctionInput,
  createConstructorInput,
  getConstructorInputs
}