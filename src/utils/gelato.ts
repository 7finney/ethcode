import { ExtensionContext, InputBoxOptions, window, workspace } from "vscode";
import { logger } from "../lib";
import { CompiledJSONOutput, getAbi, IFunctionQP } from "../types";
import * as fs from "fs";
import * as path from "path";
import { JsonFragment } from "@ethersproject/abi";
import {
  CreateTaskOptions,
  GelatoOpsSDK,
  TaskTransaction,
  OPS_TASKS_API,
} from "@gelatonetwork/ops-sdk";
import { getSelectedProvider } from "./networks";
import { ethers } from "ethers";
import { getDeployedInputs } from "./functions";
import { extractPvtKey } from "./wallet";

const getFunctionInputFullPath = (contract: CompiledJSONOutput) => {
  if (contract.path == undefined) {
    throw new Error("Contract Path is empty.");
  }

  return path.join(contract.path, `${contract.name}_functions_input.json`);
};

const getFunctionParmas = (func: JsonFragment) => {
  const inputs = func.inputs?.map((e) => e.type);
  return inputs?.join(", ");
};

const getContractFunctionInputs = async (
  context: ExtensionContext
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

const getContractSigner = async (context: ExtensionContext) => {
  const account = context.workspaceState.get("account") as string;
  const provider = getSelectedProvider(
    context
  ) as ethers.providers.JsonRpcProvider;
  const privateKey = await extractPvtKey(context.extensionPath, account);
  const wallet = new ethers.Wallet(privateKey);
  const signingAccount = wallet.connect(provider);
  return signingAccount;
};

const getNewAutomationName = async () => {
  const opts: InputBoxOptions = {
    ignoreFocusOut: true,
    placeHolder: "Name your automation",
  };
  const automationName = await window.showInputBox(opts);
  return automationName;
};

const getAutomationInterval = async () => {
  const opts: InputBoxOptions = {
    ignoreFocusOut: true,
    placeHolder: "Automation interval",
  };
  const automationInterval = await window.showInputBox(opts);
  const automationInNumber = parseInt(automationInterval as string);
  return automationInNumber;
};

const getGelatotaskID = async () => {
  const opts: InputBoxOptions = {
    ignoreFocusOut: true,
    placeHolder: "Enter Task ID",
  };
  const taskID = await window.showInputBox(opts);
  return taskID;
};

const createNewGelatoTask = async (
  context: ExtensionContext,
  abi: JsonFragment[],
  abiItem: JsonFragment,
  params: any[]
) => {
  try {
    // data for options
    const automationName = await getNewAutomationName();
    const automationInterval = await getAutomationInterval();
    const contractAddress = getDeployedInputs(context).address;
    const contract = new ethers.Contract(contractAddress, abi);
    const signingAccount = await getContractSigner(context);
    const chainId = await (await signingAccount.provider.getNetwork()).chainId;
    const gelatoOps = new GelatoOpsSDK(chainId, signingAccount);

    const selector = contract.interface.getSighash(
      `${abiItem.name as string}(${getFunctionParmas(abiItem)})`
    );
    const functionData = contract.interface.encodeFunctionData(
      abiItem.name as string,
      params
    );
    const options: CreateTaskOptions = {
      name: automationName as string,
      execAddress: contractAddress,
      execSelector: selector,
      execAbi: abi.toString(),
      execData: functionData,
      interval: automationInterval,
      startTime: 0,
    };
    logger.log("creating gelato automation task...");
    const { taskId }: TaskTransaction = await gelatoOps.createTask(options);
    logger.log(`gelato automation task ID is: ${taskId}`);
  } catch (error) {
    logger.log(error);
  }
};

const createGelatoAutomation = async (context: ExtensionContext) => {
  const compiledOutput = (await context.workspaceState.get(
    "contract"
  )) as CompiledJSONOutput;
  const abi = getAbi(compiledOutput);
  const abiItem = await getContractFunctionInputs(context);
  if (abi == undefined) throw new Error("Abi is not defined.");

  if (abiItem === undefined) throw new Error("Function is not defined.");
  const params_ = abiItem.inputs?.map((e: any) => e.value);
  const params = params_ === undefined ? [] : params_;
  await createNewGelatoTask(context, abi as JsonFragment[], abiItem, params);
};

const cancelGelatoTask = async (context: ExtensionContext) => {
  const taskID = await getGelatotaskID();
  const signingAccount = await getContractSigner(context);
  const chainId = await (await signingAccount.provider.getNetwork()).chainId;
  const gelatoOps = new GelatoOpsSDK(chainId, signingAccount);
  logger.log(
    `cancelling gelato task ${taskID?.slice(0, 6)}...${taskID?.slice(-6)}`
  );
  await gelatoOps
    .cancelTask(taskID as string)
    .then(() => {
      logger.log(
        `gelato task ${taskID?.slice(0, 6)}...${taskID?.slice(-6)} is cancelled`
      );
    })
    .catch((err) => {
      logger.log(err);
    });
};

const getActiveGelatoTasks = async (context: ExtensionContext) => {
  const signingAccount = await getContractSigner(context);
  const chainId = await (await signingAccount.provider.getNetwork()).chainId;
  const gelatoOps = new GelatoOpsSDK(chainId, signingAccount);
  logger.log("fetching active gelato tasks...");
  await gelatoOps
    .getActiveTasks()
    .then((tasks) => {
      if (tasks.length === 0) {
        logger.log("no active gelato task.");
      } else {
        logger.log("Active gelato tasks:");
        tasks.map((task, index) => {
          logger.log(
            `${index + 1}. taskID: ${task.taskId
              .slice(0, 6)
              .toString()}...${task.taskId
              .slice(-6)
              .toString()} | Name: ${task.name.toString()}`
          );
        });
      }
    })
    .catch((err) => {
      logger.log(err);
    });
};
export { createGelatoAutomation, cancelGelatoTask, getActiveGelatoTasks };
