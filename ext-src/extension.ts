import * as path from "path";
import * as vscode from "vscode";
import { fork, ChildProcess } from "child_process";
import * as fs from "fs";
import { RemixURLResolver } from "remix-url-resolver";
import axios, { AxiosResponse } from "axios";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("ethcode.activate", () => {
      ReactPanel.createOrShow(context.extensionPath);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("ethcode.compile", () => {
      if (!ReactPanel.currentPanel) {
        return;
      }
      const fileName = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.fileName
        : undefined;
      const editorContent = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.getText()
        : undefined;
      ReactPanel.currentPanel.sendCompiledContract(editorContent, fileName);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("ethcode.refactor", () => {
      if (!ReactPanel.currentPanel) {
        return;
      }
      console.log("Doing refactor");
      ReactPanel.currentPanel.doRefactor();
    })
  );
}

/**
 * Manages react webview panels
 */
class ReactPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ReactPanel | undefined;

  private static readonly viewType = "ethcode";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];
  // @ts-ignore
  private compiler: any;

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor ? -2 : undefined;

    // If we already have a panel, show it.
    // Otherwise, create a new panel.
    if (ReactPanel.currentPanel) {
      ReactPanel.currentPanel._panel.reveal(column);
    } else {
      ReactPanel.currentPanel = new ReactPanel(
        extensionPath,
        column || vscode.ViewColumn.One
      );
    }
  }

  private constructor(extensionPath: string, column: vscode.ViewColumn) {
    this._extensionPath = extensionPath;

    // Create and show a new webview panel
    this._panel = vscode.window.createWebviewPanel(
      ReactPanel.viewType,
      "ETHcode",
      column,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restric the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.file(path.join(this._extensionPath, "build"))
        ]
      }
    );

    // Set the webview's initial html content
    this._panel.webview.html = this._getHtmlForWebview();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message: any) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public doRefactor() {
    // Send a message to the webview
    // You can send any JSON serializable data.
    this._panel.webview.postMessage({ command: "refactor view" });
  }
  async handleGithubCall(root: string, filePath: string) {
    try {
      let req: string =
        "https://api.github.com/repos/" + root + "/contents/" + filePath;
      const response: AxiosResponse = await axios.get(req);
      return Buffer.from(response.data.content, "base64").toString();
    } catch (e) {
      throw e;
    }
  }
  /**
   * Handle an import statement based on http
   * @params url The url of the import statement
   * @params cleanURL
   */
  async handleHttp(url: string, _: string) {
    try {
      const response: AxiosResponse = await axios.get(url);
      return response.data;
    } catch (e) {
      throw e;
    }
  }
  /**
   * Handle an import statement based on https
   * @params url The url of the import statement
   * @params cleanURL
   */
  async handleHttps(url: string, _: string) {
    try {
      const response: AxiosResponse = await axios.get(url);
      return response.data;
    } catch (e) {
      throw e;
    }
  }
  handleSwarm(url: string, cleanURL: string) {
    return;
  }
  /**
   * Handle an import statement based on IPFS
   * @params url The url of the IPFS import statement
   */
  async handleIPFS(url: string) {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, "ipfs/");
    try {
      const req = "https://gateway.ipfs.io/" + url;
      // If you don't find greeter.sol on ipfs gateway use local
      // const req = 'http://localhost:8080/' + url
      const response: AxiosResponse = await axios.get(req);
      return response.data;
    } catch (e) {
      throw e;
    }
  }
  private handleLocal(pathString: string, filePath: any) {
    // if no relative/absolute path given then search in node_modules folder
    if (
      pathString &&
      pathString.indexOf(".") !== 0 &&
      pathString.indexOf("/") !== 0
    ) {
      // return handleNodeModulesImport(pathString, filePath, pathString)
      return;
    } else {
      const o = { encoding: "UTF-8" };
      const p = pathString
        ? path.resolve(pathString, filePath)
        : path.resolve(pathString, filePath);
      const content = fs.readFileSync(p, o);
      return content;
    }
  }

  private createWorker(): ChildProcess {
    return fork(path.join(__dirname, "worker.js"), [], {
      execArgv: ["--inspect=" + (process.debugPort + 1)]
    });
  }
  public sendCompiledContract(
    editorContent: string | undefined,
    fn: string | undefined
  ) {
    // send JSON serializable compiled data
    const sources: ISources = {};
    if (fn) {
      sources[fn] = {
        content: editorContent
      };
    }
    var input = {
      language: "Solidity",
      sources,
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"]
          }
        }
      }
    };
    // child_process won't work because of debugging issue if launched with F5
    // child_process will work when launched with ctrl+F5
    // more on this - https://github.com/Microsoft/vscode/issues/40875
    const solcWorker = this.createWorker();
    console.log("WorkerID: ", solcWorker.pid);
    solcWorker.send({ command: "compile", payload: input });
    solcWorker.on("message", (m: any) => {
      console.log(m);

      if (m.path) {
        const FSHandler = [
          {
            type: "local",
            match: (url: string) => {
              return /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?(\w+\.sol)/g.exec(
                url
              );
            },
            handle: (match: Array<string>) => {
              return this.handleLocal(match[2], match[3]);
            }
          },
          {
            type: "github",
            match: (url: string) => {
              return /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/.exec(
                url
              );
            },
            handle: (match: Array<string>) =>
              this.handleGithubCall(match[3], match[4])
          },
          {
            type: "http",
            match: (url: string) => {
              return /^(http?:\/\/?(.*))$/.exec(url);
            },
            handle: (match: Array<string>) =>
              this.handleHttp(match[1], match[2])
          },
          {
            type: "https",
            match: (url: string) => {
              return /^(https?:\/\/?(.*))$/.exec(url);
            },
            handle: (match: Array<string>) =>
              this.handleHttps(match[1], match[2])
          },
          {
            type: "swarm",
            match: (url: string) => {
              return /^(bzz-raw?:\/\/?(.*))$/.exec(url);
            },
            handle: (match: Array<string>) =>
              this.handleSwarm(match[1], match[2])
          },
          {
            type: "ipfs",
            match: (url: string) => {
              return /^(ipfs:\/\/?.+)/.exec(url);
            },
            handle: (match: Array<string>) => this.handleIPFS(match[1])
          }
        ];

        const urlResolver = new RemixURLResolver();
        urlResolver
          .resolve(m.path, FSHandler)
          .then((sources: object) => {
            sources[m.path] = sources;
          })
          .catch((e: Error) => {
            throw e;
          });

        // console.log(sources);

        solcWorker.send({ command: "compile", payload: input });
      }

      if (m.compiled) {
        this._panel.webview.postMessage({ compiled: m.compiled });
        solcWorker.kill();
      }
    });
    solcWorker.on("error", (error: Error) => {
      console.log(
        "%c Compile worker process exited with error" + `${error.message}`,
        "background: rgba(36, 194, 203, 0.3); color: #EF525B"
      );
    });
    solcWorker.on("exit", (code: number, signal: string) => {
      console.log(
        "%c Compile worker process exited with " +
          `code ${code} and signal ${signal}`,
        "background: rgba(36, 194, 203, 0.3); color: #EF525B"
      );
      this._panel.webview.postMessage({
        message: `Error code ${code} : Error signal ${signal}`
      });
    });
  }

  public dispose() {
    ReactPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview() {
    const manifest = require(path.join(
      this._extensionPath,
      "build",
      "asset-manifest.json"
    ));
    const mainScript = manifest["main.js"];
    const mainStyle = manifest["main.css"];

    const scriptPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "build", mainScript)
    );
    const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });
    const stylePathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "build", mainStyle)
    );
    const styleUri = stylePathOnDisk.with({ scheme: "vscode-resource" });

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>ETH code</title>
				<link rel="stylesheet" type="text/css" href="${styleUri}">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
				<base href="${vscode.Uri.file(path.join(this._extensionPath, "build")).with({
          scheme: "vscode-resource"
        })}/">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
