# Ethcode - Smart Contract Development & Execution Interface

[![Discord chat](https://img.shields.io/discord/722971683388129290?color=7389D8&logo=discord&logoColor=ffffff)](https://discord.gg/yBBmtqGvxK)

Ethcode is a vscode extension that helps deploy and execute solidity smart contracts in EVM based blockchains. It supports multiple test networks.

## Website

https://ethcode.dev

## Docs

https://docs.ethcode.dev

## Installation

VisualStudio Marketplace - https://marketplace.visualstudio.com/items?itemName=7finney.ethcode

## System support

- Linux, Mac, Windows

## Help

Please help ethcode developers continue their work.

Ethereum donation address: [0xd22fE4aEFed0A984B1165dc24095728EE7005a36](https://etherscan.io/address/0xd22fE4aEFed0A984B1165dc24095728EE7005a36)

## Development

### Run following commands in the terminal

```shell
npm install
npm run compile
```

And then press F5, in Extension Development Host session, run `Ethereum: Solidity compile` command from command palette.

## Packaging

```shell
vsce package
```

## Publishing

Step 1: Login to https://dev.azure.com/ and generate PAT for your user or organization

Step 2:

```shell
vsce login <publisher>
vsce publish 0.1.4 -p <access token>
git push origin v0.1.4
```

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
