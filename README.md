# Ethcode - Smart Contract Development & Execution Interface

[![Discord chat](https://img.shields.io/discord/722971683388129290?color=7389D8&logo=discord&logoColor=ffffff)](https://discord.gg/yBBmtqGvxK)

Ethcode is a vscode extension for compiling, deploy, execute solidity and vyper smart contracts/programs in Ethereum blockchian. It supports multiple test networks. Ethcode has inbuilt support for Remix transaction debug and solidity unit testing.

## Website

https://ethcode.dev/

## Docs

https://docs.ethcode.dev/

## Installation

VisualStudio Marketplace - https://marketplace.visualstudio.com/items?itemName=ethential.ethcode

## System support

- Linux, Mac, Windows

## Usage instructions

### Activate Ethcode

- Keyboard shortcut: `ctrl + alt + e`
- Command: `ethcode.activate`
  (`ctrl + shift + P` to open command palette)

![Untitled](https://user-images.githubusercontent.com/87822922/179242559-30be9e9a-b961-4bb7-8879-d2fc3842d154.png)

---

### Select Ethereum Network

- Open command palette `ctrl + shift + P`
- `Select ethereum network` > Select your preferred network

![Untitled](https://user-images.githubusercontent.com/87822922/179243285-ac50d6f1-3f21-4f84-b0d4-3f00bd8c1011.png)

![Untitled](https://user-images.githubusercontent.com/87822922/179243288-791e14fd-4336-4ddc-b49e-08418359392e.png)

---

### Select Ethereum Account

- Open command palette `ctrl + shift + P`
- `Select ethereum account` > Select your preferred account

![Untitled](https://user-images.githubusercontent.com/87822922/179243280-36a605e1-9702-4e48-b65d-e62f584ed4ce.png)

![Untitled](https://user-images.githubusercontent.com/87822922/179243282-7f867605-ce7d-484f-96d2-a0b6ad5a3021.png)

---

### Fetch Account Balance

- Open command palette `ctrl + shift + P`
- `Get account balance`

![Untitled](https://user-images.githubusercontent.com/87822922/179243306-0f0b6476-8dd3-4506-8737-f9995798d933.png)

![Untitled](https://user-images.githubusercontent.com/87822922/179243267-02a57374-7d01-40fb-b0a2-55c2cc830c40.png)

---

### Load All Compiled JSON Output

- Open command palette `ctrl + shift + P`
- `Load all compiled JSON output`

![Untitled](https://user-images.githubusercontent.com/87822922/179243274-a266417b-ad25-483b-83cb-0ed9a83d1c09.png)

---

### Select one compiled json output

- Open command palette `ctrl + shift + P`
- `Select one compiled JSON output`

![Untitled](https://user-images.githubusercontent.com/87822922/179243295-cf801c31-bff0-4e8b-9d9f-e01078a7ad86.png)

![Untitled](https://user-images.githubusercontent.com/87822922/179243298-595ddcaa-86e9-42d8-9a19-d8c0b8d90e5b.png)

- After selecting compiled `JSON` output

1. If the contract requires any constructor parameter to be passed then extra 3 files will be created in your `artifacts → contracts → <contract name>` folder

   `<contract name>_constructor-input.json`

   `<contract name>_deployed-address.json`

   `<contract name>_functions_input.json`

1. If the contract does not require any constructor parameter to be passed extra then 2 files will be created in your `artifacts → contracts → <contract name>` folder.

   `<contract name>_deployed-address.json`

   `<contract name>_functions_input.json`

---

### Deploy a smart contract

- Open command palette `ctrl + shift + P`
- `Deploy a Contract`
- Enter password
- After successful contract deployment, you will get deployed contract address

![contract address.png](https://user-images.githubusercontent.com/87822922/179243300-29128fb5-2c5d-4898-843b-280a942d08a2.png)

- paste this address in `artifacts → contracts → <contract name> → <contract name>_deployed-address.json` file.

---

### Contract call

- Open command palette `ctrl + shift + P`
- `Contract call` All Functions or methods of the contract will be shown in the list
- select preferred method

![call.png](https://user-images.githubusercontent.com/87822922/179247368-0ea2fb12-fcfa-41f3-bfe8-834144648421.png)

#### Note: Before selecting methods you should fill required values of that method in `artifacts → contracts → <contract name> → <contract name>_functions_input.json` file.

## [Vyper](https://vyper.readthedocs.io/) support

Please install vyper compiler for compiling vyper contracts in ethcode. Instructions for vyper compiler installation can be found on official vyper documentation - https://vyper.readthedocs.io/en/latest/installing-vyper.html

## Help

Please help ethcode developers continue their work.

Ethereum donation address: [0xd22fE4aEFed0A984B1165dc24095728EE7005a36](https://etherscan.io/address/0xd22fE4aEFed0A984B1165dc24095728EE7005a36)

## Development

### Run following commands in the terminal

```shell
yarn install
yarn run build
```

And then press F5, in Extension Development Host session, run `Ethereum: Solidity compile` command from command palette.

### Generate Typescript types for protobuf

```shell
PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
OUT_DIR="./src/"
protoc --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" --js_out="import_style=commonjs,binary:${OUT_DIR}" --ts_out="${OUT_DIR}" services/ethereum.proto
```

## Packaging

```shell
vsce package --yarn
```

## Publishing

Step 1: Login to https://dev.azure.com/0mkar/ and generate PAT

Step 2:

```
vsce login ethential
vsce publish 0.1.4 -p <access token> --yarn
git push origin v0.1.4
```

## Under the hood

Things we did on top of Create React App TypeScript template

- We inline `index.html` content in `src/extension.ts` when creating the webview
- We set strict security policy for accessing resources in the webview.
  - Only resources in `/build` can be accessed
  - Only resources whose scheme is `vscode-resource` can be accessed.
- For all resources we are going to use in the webview, we change their schemes to `vscode-resource`
- Since we only allow local resources, absolute path for styles/images (e.g., `/static/media/logo.svg`) will not work. We add a `.env` file which sets `PUBLIC_URL` to `./` and after bundling, resource urls will be relative.
- We add baseUrl `<base href="${vscode.Uri.file(path.join(this._extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">` and then all relative paths work.

## Code formatting

Add following lines in vscode `settings.json`

```
"typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": false,
"typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces": true,
"typescript.format.semicolons": "insert"
```

## References

- https://github.com/Microsoft/vscode-go/wiki/Building,-Debugging-and-Sideloading-the-extension-in-Visual-Studio-Code
- https://code.visualstudio.com/api/working-with-extensions/bundling-extension
- https://stackoverflow.com/questions/50885128/how-can-i-debug-a-child-process-fork-process-from-visual-studio-code
- https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_automatically-attach-debugger-to-nodejs-subprocesses
