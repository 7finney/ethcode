import { window, type OutputChannel } from 'vscode'

const successToast = (msg: string): any => {
  void window.showInformationMessage(msg, 'Dismiss')
}

const errorToast = (msg: string): any => {
  void window.showErrorMessage(msg, 'Dismiss')
}

export class Logger {
  private readonly outputChannel: OutputChannel

  constructor (name?: string) {
    this.outputChannel = window.createOutputChannel(name != null ? name : 'Ethcode')
  }

  private readonly getNow = (): string => {
    const date = new Date(Date.now())
    return date.toLocaleTimeString()
  }

  public log (...m: any[]): any {
    const now = this.getNow()
    this.outputChannel.appendLine(`[${now}]: ${m.join('')}`)
    this.outputChannel.show()
  }

  public error (e: any): any {
    const now = this.getNow()
    this.outputChannel.appendLine(`[${now}] Error: ${e.message as string}`)
    this.outputChannel.appendLine(`[${now}] Error stack: ${JSON.stringify(e.stack)}`)
    this.outputChannel.show()
    errorToast(`Error: ${e.message as string}`)
  }

  public success (m: string): any {
    const now = this.getNow()
    this.outputChannel.appendLine(`[${now}]: ${m}`)
    this.outputChannel.show()
    successToast(m)
  }
}
