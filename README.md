# Ethereum IDE in VSCode

## System support
* Linux - ETHcode now only works upto [vscode version 1.30.2](https://code.visualstudio.com/updates/v1_30)
* Mac - ETHcode supports upto latest version
* Windows - unknown

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

## Under the hood

Things we did on top of Create React App TypeScript template

* We inline `index.html` content in `ext-src/extension.ts` when creating the webview
* We set strict security policy for accessing resources in the webview.
  * Only resources in `/build` can be accessed
  * Only resources whose scheme is `vscode-resource` can be accessed.
* For all resources we are going to use in the webview, we change their schemes to `vscode-resource`
* Since we only allow local resources, absolute path for styles/images (e.g., `/static/media/logo.svg`) will not work. We add a `.env` file which sets `PUBLIC_URL` to `./` and after bundling, resource urls will be relative.
* We add baseUrl `<base href="${vscode.Uri.file(path.join(this._extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">` and then all relative paths work.

## References
* https://github.com/Microsoft/vscode-go/wiki/Building,-Debugging-and-Sideloading-the-extension-in-Visual-Studio-Code
* https://code.visualstudio.com/api/working-with-extensions/bundling-extension
* https://stackoverflow.com/questions/50885128/how-can-i-debug-a-child-process-fork-process-from-visual-studio-code
* https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_automatically-attach-debugger-to-nodejs-subprocesses