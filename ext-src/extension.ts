import * as path from "path";
// @ts-ignore
import * as vscode from "vscode";
import { fork, ChildProcess } from "child_process";
import { ISources } from "./types";

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
      ReactPanel.currentPanel.sendCompiledContract(
        context,
        editorContent,
        fileName
      );
    }),
    vscode.commands.registerCommand("ethcode.runTest", () => {
      if (!ReactPanel.currentPanel) {
        return;
      }
      const fileName = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.fileName
        : undefined;
      const editorContent = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.getText()
        : undefined;
      ReactPanel.currentPanel.sendTestContract(editorContent, fileName);
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
  private version: string;

  public static createOrShow(extensionPath: string) {
    const column = vscode.window.activeTextEditor ? -2 : undefined;

    // If we already have a panel, show it.
    // Otherwise, create a new panel.
    if (ReactPanel.currentPanel) {
      try {
        ReactPanel.currentPanel.getCompilerVersion();
        ReactPanel.currentPanel.version = "latest";

        ReactPanel.currentPanel._panel.reveal(column);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.One);
        ReactPanel.currentPanel.version = "latest";
        ReactPanel.currentPanel.getCompilerVersion();
      } catch (error) {
        console.error(error);
      }
    }
  }

  private constructor(extensionPath: string, column: vscode.ViewColumn) {
    this._extensionPath = extensionPath;

    // Create and show a new webview panel
    this._panel = vscode.window.createWebviewPanel(ReactPanel.viewType, "ETHcode", column,
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
        if(message.command === 'version') {
          this.version = message.version;
        } else if(message.command === 'run-deploy') {
          this.runDeploy(message.payload);
        } else if(message.command === 'run-get-gas-estimate') {
          this.runGetGasEstimate(message.payload);
        } else if(message.command === 'debugTransaction') {
          this.debug(message.txHash);
        }
      },
      null,
      this._disposables
    );
  }

  private createWorker(): ChildProcess {
    // enable --inspect for debug
    // return fork(path.join(__dirname, "worker.js"), [], {
    //   execArgv: ["--inspect=" + (process.debugPort + 1)]
    // });
    return fork(path.join(__dirname, "worker.js"));
  }
  private createVyperWorker(): ChildProcess {
    // enable --inspect for debug
    // return fork(path.join(__dirname, "vyp-worker.js"), [], {
    //   execArgv: ["--inspect=" + (process.debugPort + 1)]
    // });
    return fork(path.join(__dirname, "vyp-worker.js"));
  }
  private invokeSolidityCompiler(context: vscode.ExtensionContext, sources: ISources): void {
		// solidity compiler code goes bellow
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
		console.dir("WorkerID: ", solcWorker.pid);
		console.dir("Compiling with solidity version ", this.version);
		// Reset Components State before compilation
		this._panel.webview.postMessage({ processMessage: "Compiling..." });
		solcWorker.send({
			command: "compile",
			payload: input,
			version: this.version
		});
		solcWorker.on("message", (m: any) => {
			if (m.data && m.path) {
				sources[m.path] = {
					content: m.data.content
				};
				solcWorker.send({
					command: "compile",
					payload: input,
					version: this.version
				});
			}
			if (m.compiled) {
				// console.dir(m.compiled);
				// console.dir(JSON.stringify(sources));
				context.workspaceState.update("sources", JSON.stringify(sources));

        this._panel.webview.postMessage({ compiled: m.compiled, sources, newCompile: true, testPanel: 'main' });
				solcWorker.kill();
			}
			if (m.processMessage) {
				this._panel.webview.postMessage({ processMessage: m.processMessage });
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
	private invokeVyperCompiler(context: vscode.ExtensionContext, sources: ISources): void {
		const vyperWorker = this.createVyperWorker();
		console.dir("WorkerID: ", vyperWorker.pid);
		console.dir("Compiling with vyper compiler version ", this.version);
		this._panel.webview.postMessage({ processMessage: "Compiling..." });
		vyperWorker.send({
			command: "compile",
			source: sources,
			version: this.version
		});
		vyperWorker.on('message', (m) => {
			if (m.compiled) {
				context.workspaceState.update("sources", JSON.stringify(sources));

				this._panel.webview.postMessage({ compiled: m.compiled, sources });
				vyperWorker.kill();
			}
			if (m.processMessage) {
				this._panel.webview.postMessage({ processMessage: m.processMessage });
			}
		});
	}
  private debug(txHash: string): void {
    const debugWorker = this.createWorker();
    console.dir("WorkerID: ", debugWorker.pid);
    console.dir("Debugging transaction with remix-debug...");
    debugWorker.on("message", (m: any) => {
      this._panel.webview.postMessage({ txTrace: m.debugResp });
    });
    debugWorker.send({ command: "debug-transaction", payload: txHash });
  }
  // Deploy contracts
  private runDeploy(payload: any) {
    const deployWorker = this.createWorker();
    deployWorker.on("message", (m: any) => {
      if(m.error) {
        this._panel.webview.postMessage({ errors: m.error });
      }
      else {
        this._panel.webview.postMessage({ deployedResult: m });
      }
    });
    deployWorker.send({ command: "deploy-contract", payload });
  }
  // Get gas estimates
  private runGetGasEstimate(payload: any) {
    const deployWorker = this.createWorker();

    deployWorker.on("message", (m: any) => {
        if(m.error) {
        this._panel.webview.postMessage({ errors: m.error });
      }
      else {
        this._panel.webview.postMessage({ gasEstimate: m.gasEstimate });
      }
    });
    deployWorker.send({ command: "get-gas-estimate", payload });
  }
  public sendCompiledContract(context: vscode.ExtensionContext, editorContent: string | undefined, fn: string | undefined) {
		// send JSON serializable compiled data
		const sources: ISources = {};
		if (fn) {
			sources[fn] = {
				content: editorContent
			};
			context.workspaceState.update("sources", JSON.stringify(sources));
			var re = /(?:\.([^.]+))?$/;
			const regexVyp = /([a-zA-Z0-9\s_\\.\-\(\):])+(.vy|.v.py|.vyper.py)$/g;
      const regexSol = /([a-zA-Z0-9\s_\\.\-\(\):])+(.sol|.solidity)$/g;
      // @ts-ignore
			if (fn.match(regexVyp) && fn.match(regexVyp).length > 0) {
				// invoke vyper compiler
				this.invokeVyperCompiler(context, sources);
				// @ts-ignore
			} else if (fn.match(regexSol) && fn.match(regexSol).length > 0) {
				// invoke solidity compiler
				this.invokeSolidityCompiler(context, sources);
			} else {
				throw new Error("No matching file found!");
			}
		}
	}

  public sendTestContract(editorContent: string | undefined, fn: string | undefined) {
    const sources: ISources = {};
    if (fn) {
      sources[fn] = {
        content: editorContent
      };
    }
    const solcWorker = this.createWorker();
    this._panel.webview.postMessage({ resetTestState: "resetTestState" });
    this._panel.webview.postMessage({
      processMessage: "Running unit tests..."
    });
    solcWorker.send({ command: "run-test", payload: JSON.stringify(sources) });
    solcWorker.on("message", (m: any) => {
      if (m.data && m.path) {
        sources[m.path] = {
          content: m.data.content
        };
        solcWorker.send({
          command: "run-test",
          payload: JSON.stringify(sources)
        });
      }
      if (m.utResp) {
        const res = JSON.parse(m.utResp.result);
        if (res.type) {
          this._panel.webview.postMessage({ _testCallback: res, testPanel: 'test' });
        } else {
          this._panel.webview.postMessage({ _finalCallback: res, testPanel: 'test' });
          solcWorker.kill();
        }
      }
    });
    solcWorker.on("exit", () => {
      console.dir("Tests worker exited");
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

  public getCompilerVersion() {
    const solcWorker = this.createWorker();
    solcWorker.send({ command: "fetch_compiler_verison" });
    this._panel.webview.postMessage({
      processMessage: "Fetching Compiler Versions..."
    });

    solcWorker.on("message", (m: any) => {
      if (m.versions) {
        const { versions } = m;
        this._panel.webview.postMessage({ versions });
        this._panel.webview.postMessage({ processMessage: "" });
        solcWorker.kill();
      }
    });
    solcWorker.on("error", (error: Error) => {
      console.log(
        "%c getVersion worker process exited with error" + `${error.message}`,
        "background: rgba(36, 194, 203, 0.3); color: #EF525B"
      );
    });
    solcWorker.on("exit", (code: number, signal: string) => {
      console.log(
        "%c getVersion worker process exited with " +
        `code ${code} and signal ${signal}`,
        "background: rgba(36, 194, 203, 0.3); color: #EF525B"
      );
      this._panel.webview.postMessage({
        message: `Error code ${code} : Error signal ${signal}`
      });
    });
  }

  private _getHtmlForWebview() {
    const manifest = require(path.join(
      this._extensionPath,
      "build",
      "asset-manifest.json"
    )).files;
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
        <base href="${vscode.Uri.file(
      path.join(this._extensionPath, "build")
    ).with({
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