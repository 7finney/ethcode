import * as fs from 'fs';
import * as path from 'path';
import { JsonFragment } from "@ethersproject/abi";

function flatten(lists: any) {
  return lists.reduce((a: any, b: any) => a.concat(b), []);
}

function getDirectories(srcpath: string): any {
  return fs
    .readdirSync(srcpath)
    .filter((file) => {
      return file !== 'node_modules';
    })
    .filter((file) => {
      return file !== 'package.json';
    })
    .filter((file) => {
      return file !== 'package-lock.json';
    })
    .map((file) => path.join(srcpath, file));
}

function getDirectoriesRecursive(srcpath: string, depth: number) {
  if (depth > 4) return [];

  if (fs.statSync(srcpath).isFile()) {
    const n = 5;
    if (srcpath.substring(srcpath.length - n) !== '.json') return [];

    return [srcpath];
  }

  const directories = getDirectories(srcpath);
  const subdirectories = directories.map((e: any) => getDirectoriesRecursive(e, depth + 1));
  return [...flatten(subdirectories)];
}

// create constructor input file
function writeConstrucor(path_: string, inputs: Array<JsonFragment>) {
  const fileName = path.join(path_, 'constructor-input.json');
  fs.writeFileSync(fileName, JSON.stringify(inputs, null, 2));

  // @ts-ignore
  process.send('Created constructor json');
}

// create function input file
function writeFunction(path_: string, abiItem: Array<JsonFragment>) {
  const fileName = path.join(path_, 'function-input.json');
  fs.writeFileSync(fileName, JSON.stringify(abiItem, null, 2));
}

const isHardhatProject = (path_: string) => {
  return (
    fs.readdirSync(path_).filter((file) => file === 'hardhat.config.js' || file === 'hardhat.config.ts').length > 0
  );
};

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

  // @ts-ignore
  process.send({
    type: 'try-parse-batch-json',
    paths: changedFiles,
  });
};

// @ts-ignore
process.on('message', async (m: any) => {
  if (m.command === 'load-all-compiled-json') {
    const { path } = m.payload;
    loadAllCompiledJsonOutputs(path);
  }
});