import { ExtensionContext, window, workspace } from "vscode";
import * as path from 'path';
import * as fs from 'fs';

import { logger } from "../lib";
import { CompiledJSONOutput, IFunctionQP, isHardhatProject } from "../types";
import { getDirectoriesRecursive } from "../lib/file";
import { createConstructorInput, createFunctionInput, createDeployed } from "./functions";

const parseBatchCompiledJSON = (context: ExtensionContext): void => {
  if (workspace.workspaceFolders === undefined) {
    logger.error(new Error('Please open your solidity project to vscode'));
    return;
  }

  logger.log('Loading all compiled jsons...');
  context.workspaceState.update('contracts', ''); // Initialize contracts storage

  const path_ = workspace.workspaceFolders[0].uri.fsPath;
  const paths: Array<string> = loadAllCompiledJsonOutputs(path_);

  paths.forEach((e) => {
    let name = path.parse(e).base;
    name = name.substring(0, name.length - 5);

    logger.log(`Try to parse the ${name} contract output`);

    const data = fs.readFileSync(e);
    const output: CompiledJSONOutput = getCompiledJsonObject(data);

    if (output.contractType === 0) return;
    output.path = path.dirname(e);
    output.name = name;

    logger.success(`Loaded ${name} contract and saved to workspace`);
    let contracts = context.workspaceState.get('contracts') as any;

    if (contracts === undefined || contracts === '') contracts = new Map();

    contracts[name] = output;
    context.workspaceState.update('contracts', contracts);
  });
}

// Parse Combined JSON payload
const parseCompiledJSONPayload = (context: ExtensionContext, _jsonPayload: any): void => {
  if (_jsonPayload) {
    const output = getCompiledJsonObject(_jsonPayload);
    if (output.contractType !== 0) context.workspaceState.update('contract', output);
  } else {
    logger.error(
      Error(
        'Could not load JSON file. Make sure it follows Solidity output description. Know more: https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-input-and-output-json-description.'
      )
    );
  }
}

const getCompiledJsonObject = (_jsonPayload: any): CompiledJSONOutput => {
  const output: CompiledJSONOutput = { contractType: 0 };

  try {
    const data = JSON.parse(_jsonPayload);

    if (data.bytecode !== undefined) {
      // Hardhat format

      output.contractType = 1;
      output.hardhatOutput = data;
      logger.log('Loaded Hardhat compiled json output');
    } else if (data.data !== undefined) {
      // Remix format

      output.contractType = 2;
      output.remixOutput = data;
      logger.log('Loaded Remix compiled json output');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  return output;
}

/**
 * @dev return file paths with possibility of solidity compiled output jsons
 */
const loadAllCompiledJsonOutputs = (path_: string) => {
  let allFiles;

  if (isHardhatProject(path_)) allFiles = getDirectoriesRecursive(path.join(path_, 'artifacts', 'contracts'), 0);
  else allFiles = getDirectoriesRecursive(path_, 0);

  const changedFiles = allFiles.filter((e: any) => {
    let fileName = path.parse(e).base;
    fileName = fileName.substring(0, fileName.length - 5);
    if (!fileName.includes('.')) return true;
    return false;
  });

  return changedFiles;
};

const selectContract = (context: ExtensionContext) => {
  const contracts = context.workspaceState.get('contracts') as { [name: string]: CompiledJSONOutput };

  const quickPick = window.createQuickPick<IFunctionQP>();
  if (contracts === undefined || Object.keys(contracts).length === 0) return;

  quickPick.items = Object.keys(contracts).map((f) => ({
    label: f || '',
    functionKey: f || '',
  }));
  quickPick.placeholder = 'Select a contract';
  quickPick.onDidChangeSelection((selection: Array<IFunctionQP>) => {
    if (selection[0] && workspace.workspaceFolders) {
      const { functionKey } = selection[0];
      quickPick.dispose();
      // get selected contract
      const name = Object.keys(contracts).filter((i: string) => i === functionKey);
      const contract: CompiledJSONOutput = contracts[name[0]];
      context.workspaceState.update('contract', contract);

      // Create a constructor input at the same time
      createConstructorInput(contract);
      createFunctionInput(contract);
      createDeployed(contract);

      logger.success(`Contract ${name[0]} is selected`);
    }
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

export {
  parseBatchCompiledJSON,
  parseCompiledJSONPayload,
  selectContract
}