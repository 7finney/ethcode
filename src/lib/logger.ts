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
    
    // Handle undefined or null errors
    if (!e) {
      this.outputChannel.appendLine(`[${now}] Error: Unknown error occurred`)
      this.outputChannel.show()
      errorToast('Unknown error occurred')
      return
    }
    
    // Handle error objects without message property
    const errorMessage = e.message || e.toString() || 'Unknown error'
    const errorStack = e.stack || 'No stack trace available'
    
    this.outputChannel.appendLine(`[${now}] Error: ${errorMessage}`)
    this.outputChannel.appendLine(`[${now}] Error stack: ${JSON.stringify(errorStack)}`)
    this.outputChannel.show()
    errorToast(`Error: ${errorMessage}`)
  }

  public success (m: string): any {
    const now = this.getNow()
    this.outputChannel.appendLine(`[${now}]: ${m}`)
    this.outputChannel.show()
    successToast(m)
  }
}
