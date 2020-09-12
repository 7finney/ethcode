// @ts-ignore
import * as solc from "solc";
import * as path from "path";
import * as fs from "fs";
import { RemixURLResolver } from "remix-url-resolver";
import { Uri } from "vscode";

function handleLocal(pathString: string, fileName: any, rootPath: Uri) {
  // if no relative/absolute path given then search in node_modules folder
  if (pathString && pathString.indexOf(".") !== 0 && pathString.indexOf("/") !== 0) {
    // console.error("Error: Node Modules Import is not implemented yet!");
    // throw Error("Node Modules Import is not implemented yet!");
    return handleNodeModulesImport(pathString, fileName, rootPath);
  } else {
    try {
      const o = { encoding: "UTF-8" };
      // hack for compiler imports to work (do not change)
      const p = pathString ? path.resolve(pathString, fileName) : path.resolve(pathString, fileName);
      const content = fs.readFileSync(p, o);
      return content;
    } catch (err) {
      throw err;
    }
  }
}

function handleNodeModulesImport(pathString: string, fileName: string, fileRoot: Uri) {
  const o = { encoding: 'UTF-8' };
  var modulesDir = fileRoot.path;

  while (true) {
    try {
      const p = path.join(modulesDir, '/node_modules', pathString, fileName);
      const content = fs.readFileSync(p, o);
      return content;
    } catch (err) {
      throw err;
    }
  }
}

function findImports(path: any) {
  // TODO: We need current solc file path here for relative local import
  // @ts-ignore
  process.send({ command: "process", processMessage: "importing file: " + path });
  // @ts-ignore
  process.send({ command: "import", path });
  return { 'error': 'Deferred import' };
}

function compile(m: any) {
  const vnReg = /(^[0-9].[0-9].[0-9]\+commit\..*?)+(\.)/g;
  const vnRegArr = vnReg.exec(solc.version());
  // @ts-ignore
  const vn = 'v' + (vnRegArr ? vnRegArr[1] : '');
  const input = m.payload;
  if (m.version === vn || m.version === 'latest') {
    try {
      console.log("compiling on solc-worker with local version: ", solc.version());
      const output = solc.compile(JSON.stringify(input), { import: findImports });
      const op = JSON.parse(output);
      // @ts-ignores
      process.send({ command: "compiled", output });
      if (Object.keys(op.sources).length > 0) {
        // @ts-ignore
        process.send({ command: "process", processMessage: "compilation ok!" });
        // @ts-ignore
        process.send({ command: "compile-ok" });
      }
    } catch (e) {
      // @ts-ignore
      process.send({ error: e });
    }
  } else if (m.version !== vn) {
    // @ts-ignore
    process.send({ command: "process", processMessage: "loading remote version " + m.version + "..." });
    solc.loadRemoteVersion(m.version, async (err: Error, newSolc: any) => {
      if (err) {
        // @ts-ignore
        process.send({ error: err });
      } else {
        console.log("compiling with remote version ", newSolc.version());
        try {
          const output = await newSolc.compile(JSON.stringify(input), { import: findImports });
          const op = JSON.parse(output);
          // @ts-ignore
          process.send({ command: "compiled", output });
          if (Object.keys(op.sources).length > 0) {
            // @ts-ignore
            process.send({ command: "compile-ok" });
          }
        } catch (e) {
          console.error(e);
          // @ts-ignore
          process.send({ error: e });
        }
      }
    });
  }
}

function importFiles(m: any) {
  const { path, rootPath, content } = m.payload;
  const FSHandler = [
    {
      type: "local",
      match: (url: string) => {
        return /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?([\w-]+\.sol)/g.exec(url);
      },
      handle: (match: Array<string>) => {
        return handleLocal(match[2], match[3], rootPath);
      }
    }
  ];
  if (content) {
    // @ts-ignore
    process.send({ command: "re-compile", data: { content }, path });
  } else {
    // @ts-ignore
    const urlResolver = new RemixURLResolver();
    // this section usually executes after solc returns error file not found
    urlResolver.resolve(path, FSHandler)
      .then((data: any) => {
        // @ts-ignore
        process.send({ command: "re-compile", data, path });
      })
      .catch((e: Error) => {
        // @ts-ignore
        process.send({ error: e });
      });
  }
}


process.on("message", async m => {
  if (m.command === "compile") {
    compile(m);
  } else if (m.command === "import") {
    importFiles(m);
  } else if (m.command === "exit") {
    process.exit(0);
  }
});