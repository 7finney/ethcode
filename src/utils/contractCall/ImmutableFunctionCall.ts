import { JsonFragment } from "@ethersproject/abi";
import { ethers } from "ethers";
import { ExtensionContext } from "vscode";
import { useContractType } from "../../types";
import { getSelectedProvider } from "../networks";
import { logger } from "../../lib";

export const ImmutableFunctionCall = async (
  context: ExtensionContext,
  params: any[],
  abi: readonly JsonFragment[],
  useContract: useContractType
) => {
  const { abiItemName, contractName, contractAddress } = useContract;
  const contract = new ethers.Contract(
    contractAddress,
    abi,
    getSelectedProvider(context)
  );
  const result = await contract[abiItemName](...params);
  logger.success(`Calling ${contractName} : ${abiItemName} --> Success!`);
  if (result) {
    logger.log(JSON.stringify(result));
  }
};
