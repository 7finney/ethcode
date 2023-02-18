import { window, type OutputChannel } from 'vscode'

const successToast = (msg: string) => {
  void window.showInformationMessage(msg, 'Dismiss')
}

// const warningToast = (msg: string) => {
//   void window.showWarningMessage(msg, 'Dismiss')
// }
const errorToast = (msg: string) => {
  void window.showErrorMessage(msg, 'Dismiss')
}

// const actionToast = (msg: string, actionName: string) => {
//   return window.showInformationMessage(msg, actionName, 'Dismiss')
// }

export class Logger {
  private readonly outputChannel: OutputChannel

  constructor (name?: string) {
    this.outputChannel = window.createOutputChannel(name != null ? name : 'Ethcode')
  }

  private readonly getNow = (): string => {
    const date = new Date(Date.now())
    return date.toLocaleTimeString()
  }

  public log (...m: any[]) {
    const now = this.getNow()
    this.outputChannel.appendLine(`[${now}]: ${m.join('')}`)
    this.outputChannel.show()
  }

  public error (e: any) {
    const now = this.getNow()
    this.outputChannel.appendLine(`[${now}] Error: ${e.message as string}`)
    this.outputChannel.appendLine(`[${now}] stack: ${e.stack as string}`)
    this.outputChannel.show()
    errorToast(`Error: ${e.message as string}`)
  }

  public success (m: string) {
    const now = this.getNow()
    this.outputChannel.appendLine(`[${now}]: ${m}`)
    this.outputChannel.show()
    successToast(m)
  }
}
