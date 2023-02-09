import * as vscode from "vscode";
import { window, workspace } from "vscode";
import * as fs from "fs";
import * as path from "path";
import { JsonFragment } from "@ethersproject/abi";

import {
  CompiledJSONOutput,
  ConstructorInputValue,
  getAbi,
  IFunctionQP,
  EstimateGas,
} from "../types";
import { logger } from "../lib";
import { errors } from "../config";
import {
  createDeployedFile,
  writeConstructor,
  writeFunction,
} from "../lib/file";
import { getSelectedNetConf, getSelectedNetwork } from "./networks";

import axios from "axios";

const createDeployed = (contract: CompiledJSONOutput) => {
  const fullPath = getDeployedFullPath(contract);
  if (fs.existsSync(fullPath)) {
    logger.success(
      "Functions input file already exists, remove it to add a empty file."
    );
    return;
  }

  if (
    contract === undefined ||
    contract == null ||
    workspace.workspaceFolders === undefined
  ) {
    logger.error(errors.ContractNotFound);
    return;
  }

  const input = {
    address: "",
    commit: "<git-commit>",
  };

  createDeployedFile(getDeployedFullPath(contract), contract, input);
};

const createFunctionInput = (contract: CompiledJSONOutput) => {
  const fullPath = getFunctionInputFullPath(contract);
  if (fs.existsSync(fullPath)) {
    logger.success(
      "Functions input file already exists, remove it to add a empty file."
    );
    return;
  }

  if (
    contract === undefined ||
    contract == null ||
    workspace.workspaceFolders === undefined
  ) {
    logger.error(errors.ContractNotFound);
    return;
  }

  const functionsAbi = getAbi(contract)?.filter(
    (i: JsonFragment) => i.type === "function"
  );
  if (functionsAbi === undefined || functionsAbi.length === 0) {
    logger.error("This contract doesn't have any function");
    return;
  }

  const functions = functionsAbi.map((e) => ({
    name: e.name,
    stateMutability: e.stateMutability,
    inputs: e.inputs?.map((c) => ({ ...c, value: "" })),
  }));

  writeFunction(getFunctionInputFullPath(contract), contract, functions);
};

const getDeployedFullPath = (contract: CompiledJSONOutput) => {
  if (contract.path == undefined) {
    throw new Error("Contract Path is empty.");
  }

  return path.join(contract.path, `${contract.name}_deployed_address.json`);
};

const getFunctionInputFullPath = (contract: CompiledJSONOutput) => {
  if (contract.path == undefined) {
    throw new Error("Contract Path is empty.");
  }

  return path.join(contract.path, `${contract.name}_functions_input.json`);
};

const getConstructorInputFullPath = (contract: CompiledJSONOutput) => {
  if (contract.path == undefined) {
    throw new Error("Contract Path is empty.");
  }

  return path.join(contract.path, `${contract.name}_constructor_input.json`);
};

const getDeployedInputs = (context: vscode.ExtensionContext) => {
  try {
    const contract = context.workspaceState.get(
      "contract"
    ) as CompiledJSONOutput;
    const fullPath = getDeployedFullPath(contract);
    let inputs = fs.readFileSync(fullPath).toString();
    return JSON.parse(inputs);
  } catch (e) {
    return undefined;
  }
};

const getConstructorInputs = (context: vscode.ExtensionContext) => {
  try {
    const contract = context.workspaceState.get(
      "contract"
    ) as CompiledJSONOutput;
    const fullPath = getConstructorInputFullPath(contract);
    let inputs = fs.readFileSync(fullPath).toString();

    const constructorInputs: Array<ConstructorInputValue> = JSON.parse(inputs);
    return constructorInputs.map((e) => e.value); // flattened parameters of input
  } catch (e) {
    return [];
  }
};

const getFunctionParmas = (func: JsonFragment) => {
  const inputs = func.inputs?.map((e) => e.type);
  return inputs?.join(", ");
};

const getFunctionInputs = async (
  context: vscode.ExtensionContext
): Promise<JsonFragment> => {
  return new Promise((resolve, reject) => {
    try {
      const contract = context.workspaceState.get(
        "contract"
      ) as CompiledJSONOutput;
      const fullPath = getFunctionInputFullPath(contract);
      let inputs = fs.readFileSync(fullPath).toString();

      const functions: Array<JsonFragment> = JSON.parse(inputs);

      const quickPick = window.createQuickPick<IFunctionQP>();
      quickPick.items = functions.map((f) => ({
        label: `${contract.name} > ${f.name}(${getFunctionParmas(f)})` || "",
        functionKey: f.name || "",
      }));
      quickPick.placeholder = "Select function";
      quickPick.onDidChangeSelection((selection: Array<IFunctionQP>) => {
        if (selection[0] && workspace.workspaceFolders) {
          const { functionKey } = selection[0];
          quickPick.dispose();
          const abiItem = functions.filter(
            (i: JsonFragment) => i.name === functionKey
          );
          if (abiItem.length === 0) throw new Error("No function is selected");
          resolve(abiItem[0]);
        }
      });
      quickPick.onDidHide(() => {
        quickPick.dispose();
      });
      quickPick.show();
    } catch (err) {
      reject(err);
    }
  });
};

const shouldCreateFile = (contract: CompiledJSONOutput) => {
  const fullPath = getConstructorInputFullPath(contract);
  if (fs.existsSync(fullPath)) {
    return false;
  }
  return true;
};

const createConstructorInput = (contract: CompiledJSONOutput) => {
  if (!shouldCreateFile(contract)) {
    logger.success(
      "Constructor file already exists, remove it to add a empty file"
    );
    return;
  }
  if (
    contract === undefined ||
    contract == null ||
    workspace.workspaceFolders === undefined
  ) {
    logger.error(errors.ContractNotFound);
    return;
  }

  const constructor = getAbi(contract)?.filter(
    (i: JsonFragment) => i.type === "constructor"
  );
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
    (inp) => <ConstructorInputValue>{ ...inp, value: "" }
  );

  writeConstructor(getConstructorInputFullPath(contract), contract, inputs);
};

const getNetworkBlockpriceUrl = (context: vscode.ExtensionContext) => {
  const chainID = getSelectedNetConf(context).chainID;
  if (chainID === "137" || chainID === "1") {
    return `https://api.blocknative.com/gasprices/blockprices?chainid=${chainID}`;
  } else {
    return;
  }
};

const getGasEstimates = async (
  condition: string,
  context: vscode.ExtensionContext
) => {
  let estimate: EstimateGas | undefined;
  const blockPriceUri = getNetworkBlockpriceUrl(context);
  if (blockPriceUri !== undefined) {
    await axios
      .get(blockPriceUri, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        },
      })
      .then((res: any) => {
        if (res.status === 200) {
          switch (condition) {
            case "Low": {
              estimate = res.data.blockPrices[0].estimatedPrices.find(
                (x: any) => x.confidence === 70
              ) as EstimateGas;
              break;
            }
            case "Medium": {
              estimate = res.data.blockPrices[0].estimatedPrices.find(
                (x: any) => x.confidence === 90
              ) as EstimateGas;
              break;
            }
            case "High": {
              estimate = res.data.blockPrices[0].estimatedPrices.find(
                (x: any) => x.confidence === 99
              ) as EstimateGas;
              break;
            }
          }

          return estimate;
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  return estimate;
};

const fetchERC4907Contracts = async (uri: string) => {
  const response = await axios
    .get(uri)
    .then((res) => {
      console.log(res);
      return res.data;
    })
    .catch((err) => {
      console.log("an error occoured while fetch files:", err);
    });
  return response;
};

export {
  createFunctionInput,
  createDeployed,
  createConstructorInput,
  getConstructorInputs,
  getFunctionInputs,
  getDeployedInputs,
  getGasEstimates,
  fetchERC4907Contracts,
  getDeployedFullPath,
  getFunctionInputFullPath,
  getConstructorInputFullPath,
};
