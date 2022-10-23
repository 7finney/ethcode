import * as fs from "fs";
import * as path from "path";
import { JsonFragment } from "@ethersproject/abi";
import { logger } from "./index";
import { CompiledJSONOutput } from "../types/output";

const flatten = (lists: any) => {
  return lists.reduce((a: any, b: any) => a.concat(b), []);
};

const getDirectories = (srcpath: string): any => {
  return fs
    .readdirSync(srcpath)
    .filter((file) => {
      return file !== "node_modules";
    })
    .filter((file) => {
      return file !== "package.json";
    })
    .filter((file) => {
      return file !== "package-lock.json";
    })
    .map((file) => path.join(srcpath, file));
};

const getDirectoriesRecursive = (srcpath: string, depth: number) => {
  if (depth > 4) return [];

  if (fs.statSync(srcpath).isFile()) {
    const n = 5;
    if (srcpath.substring(srcpath.length - n) !== ".json") return [];

    return [srcpath];
  }

  const directories = getDirectories(srcpath);
  const subdirectories = directories.map((e: any) =>
    getDirectoriesRecursive(e, depth + 1)
  );
  return [...flatten(subdirectories)];
};

// create constructor input file
const writeConstructor = (
  fileName: string,
  contract: CompiledJSONOutput,
  inputs: Array<JsonFragment>
) => {
  fs.writeFileSync(fileName, JSON.stringify(inputs, null, 2));
  logger.success(`Created constructor json of ${contract.name} contract`);
};

// create function input file
const writeFunction = (
  fileName: string,
  contract: CompiledJSONOutput,
  inputs: Array<JsonFragment>
) => {
  fs.writeFileSync(fileName, JSON.stringify(inputs, null, 2));
  logger.success(`Created functions input json of ${contract.name} contract`);
};

const createDeployedFile = (
  fileName: string,
  contract: CompiledJSONOutput,
  input: any
) => {
  fs.writeFileSync(fileName, JSON.stringify(input, null, 2));
  logger.success(`Created deployed json format of ${contract.name} contract`);
};

const createUserERC4907ContractFile = (
  fileName: string,
  data: string,
  contractName: string
) => {
  fs.writeFileSync(fileName, data);
  logger.success(`${contractName} file is created successfully.`);
};

const createERC4907ContractInterface = (
  fileName: string,
  data: string,

) => {
  fs.writeFileSync(fileName, data);
  logger.success(`IERC4907 interface is created successfully.`);
};
const createERC4907ContractFile = (
  fileName: string,
  data: string,
) => {
  fs.writeFileSync(fileName, data);
  logger.success(`ERC4907 contract file is created successfully.`);
};
export {
  writeConstructor,
  writeFunction,
  createDeployedFile,
  getDirectoriesRecursive,
  createUserERC4907ContractFile,
  createERC4907ContractInterface,
  createERC4907ContractFile
};
