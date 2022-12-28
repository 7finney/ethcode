import { ethers } from "ethers";
import { ExtensionContext } from "vscode";
import { logger } from "../../lib";
import { EstimateGas, useContractType } from "../../types";
import { getGasEstimates } from "../functions";
import {
  getConfiguration,
  getSelectedNetConf,
  getSignedContract,
} from "../networks";

export const MutableFunctionCall = async (
  context: ExtensionContext,
  state: string,
  params: any[],
  useContract: useContractType
) => {
  const MAX_FEE_PER_GAS = 100;
  const { abiItemName, contractAddress, contractName } = useContract;

  const contract = await getSignedContract(context, contractAddress);

  let gasCondition = (await context.workspaceState.get("gas")) as string;

  const gasEstimate: EstimateGas | undefined = await getGasEstimates(
    gasCondition,
    context
  );

  const maxFeePerGas =
    gasEstimate !== undefined ? gasEstimate.maxFeePerGas : MAX_FEE_PER_GAS;

  const settingsGasLimit = (await getConfiguration().get("gasLimit")) as number;

  const value =
    state === "payable" ? await context.workspaceState.get("payableValue") : 0;

  const result = await contract[abiItemName as string](...params, {
    value: value,
    gasPrice: ethers.utils.parseUnits(maxFeePerGas.toString(), "gwei"),
    gasLimit: settingsGasLimit,
  });

  logger.success("Waiting for confirmation...");

  await result.wait();
  logger.success("Transaction confirmed!");
  logger.success(`Calling ${contractName} : ${abiItemName} --> Success!`);
  logger.success(
    `You can see detail of this transaction here. ${
      getSelectedNetConf(context).blockScanner
    }/tx/${result.hash}`
  );
};
