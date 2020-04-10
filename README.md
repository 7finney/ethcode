# Ethereum plugin for VSCode
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/Ethereum-Devtools-Developers-Studio/ethcode)

Ethcode is a vscode plugin for compiling, deploy, execute solidity and vyper smart contracts/programs in Ethereum blockchian. It supports multiple test networks. Ethcode has inbuilt support for Remix transaction debug and solidity unit testing.

## System support
* Linux, Mac, Windows

## Usage instructions
`ctrl+alt+e` - activate the plugin.

![Screenshot from 2019-09-28 23-04-40](https://user-images.githubusercontent.com/13261372/78938476-e9f22180-7acf-11ea-8705-5a7f755a962a.png)

`ctrl+alt+c` - compile contracts.

![Screenshot from 2019-09-28 23-05-13](https://user-images.githubusercontent.com/13261372/71320562-e57b0c00-24d2-11ea-9b17-2629da608c6d.png)

Deploy contracts to test network.

![Screenshot from 2020-04-10 03-04-40](https://user-images.githubusercontent.com/13261372/78942930-5709b500-7ad8-11ea-8557-511fd4e537cc.png)

`ctrl+alt+t` - run unit testing.

![Screenshot from 2019-10-30 20-00-05](https://user-images.githubusercontent.com/13261372/78938685-448b7d80-7ad0-11ea-8248-d2494269b52e.png)

**Note:** *compilation with latest/default version is faster. compilation with any other selected version can be slower as it loads the compiler version from internet.*

## Vyper support
Please install vyper compiler for compiling vyper contracts in ethcode. Instructions for vyper compiler installation can be found on official vyper documentation - https://vyper.readthedocs.io/en/latest/installing-vyper.html

## Use locally generated key-pair to use with test networks
Ethcode signs all transactions using generated key-pair in your computer. Use `Generate key pair` button to generate one. Then go to respective test network faucet and get some testnet ether. For `Görli` use [goerli-faucet](https://goerli-faucet.slock.it).

![Screenshot from 2020-04-11 01-02-38](https://user-images.githubusercontent.com/13261372/79018200-db1f7380-7b90-11ea-98f6-846f26405b35.png)

## Help
Please help ethcode developers continue their work.

Ethereum donation address: 0xd22fE4aEFed0A984B1165dc24095728EE7005a36

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
vsce login quantanetwork
vsce publish 0.1.4 -p <access token> --yarn
git push origin v0.1.4
```
Extension marketplace link - https://marketplace.visualstudio.com/items?itemName=quantanetwork.ethcode

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
