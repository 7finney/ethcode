# [Ethereum](https://ethereum.org/) plugin for [VSCode](https://code.visualstudio.com/)
[![Join the chat at https://gitter.im/Ethential/ethcode](https://badges.gitter.im/Ethential/ethcode.svg)](https://gitter.im/Ethential/ethcode?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Discord chat](https://img.shields.io/discord/722971683388129290?color=7389D8&logo=discord&logoColor=ffffff)](https://discord.gg/87sE7Bm)

Ethcode is a vscode extension for compiling, deploy, execute solidity and vyper smart contracts/programs in Ethereum blockchian. It supports multiple test networks. Ethcode has inbuilt support for Remix transaction debug and solidity unit testing.

## Website
https://ethcode.dev/
## Docs
https://docs.ethcode.dev/
## Installation
VisualStudio Marketplace - https://marketplace.visualstudio.com/items?itemName=ethential.ethcode

## System support
* Linux, Mac, Windows

## Usage instructions
### Activate plugin with activation command
`ctrl+alt+e` - activates the plugin.

![Screenshot from 2019-09-28 23-04-40](https://user-images.githubusercontent.com/13261372/78938476-e9f22180-7acf-11ea-8705-5a7f755a962a.png)

### Load compiled JSON

![Screenshot from 2021-07-01 19-41-30](https://user-images.githubusercontent.com/13261372/124138953-c7697100-daa4-11eb-9064-5756dba06606.png)

![Screenshot from 2021-07-01 19-41-44](https://user-images.githubusercontent.com/13261372/124138945-c59fad80-daa4-11eb-954a-f47bbf0d0fec.png)

### Deploy contracts to [Goerli test network](https://github.com/goerli/testnet).

## [Vyper](https://vyper.readthedocs.io/) support
Please install vyper compiler for compiling vyper contracts in ethcode. Instructions for vyper compiler installation can be found on official vyper documentation - https://vyper.readthedocs.io/en/latest/installing-vyper.html

## Use locally generated key-pair to use with test networks
Ethcode signs all transactions using generated key-pair in your computer. Use `Generate key pair` button to generate your keys. Then go to respective test network faucet and get some testnet ether. For `Görli` use [goerli-faucet](https://goerli-faucet.slock.it).

![Screenshot from 2020-04-11 01-02-38](https://user-images.githubusercontent.com/13261372/79018200-db1f7380-7b90-11ea-98f6-846f26405b35.png)

## Help
Please help ethcode developers continue their work.

Ethereum donation address: [0xd22fE4aEFed0A984B1165dc24095728EE7005a36](https://etherscan.io/address/0xd22fE4aEFed0A984B1165dc24095728EE7005a36)

## Development
Run following commands in the terminal

```shell
yarn install
yarn run build
```
And then press F5, in Extension Development Host session, run `Ethereum: Solidity compile` command from command palette.

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

* We inline `index.html` content in `ext-src/extension.ts` when creating the webview
* We set strict security policy for accessing resources in the webview.
  * Only resources in `/build` can be accessed
  * Only resources whose scheme is `vscode-resource` can be accessed.
* For all resources we are going to use in the webview, we change their schemes to `vscode-resource`
* Since we only allow local resources, absolute path for styles/images (e.g., `/static/media/logo.svg`) will not work. We add a `.env` file which sets `PUBLIC_URL` to `./` and after bundling, resource urls will be relative.
* We add baseUrl `<base href="${vscode.Uri.file(path.join(this._extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">` and then all relative paths work.

## Code formatting
Add following lines in vscode `settings.json`
```
"typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets": false,
"typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces": true,
"typescript.format.semicolons": "insert"
```

## References
* https://github.com/Microsoft/vscode-go/wiki/Building,-Debugging-and-Sideloading-the-extension-in-Visual-Studio-Code
* https://code.visualstudio.com/api/working-with-extensions/bundling-extension
* https://stackoverflow.com/questions/50885128/how-can-i-debug-a-child-process-fork-process-from-visual-studio-code
* https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_automatically-attach-debugger-to-nodejs-subprocesses
