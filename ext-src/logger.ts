import { window, OutputChannel } from "vscode";
import {errorToast, successToast} from './utils';

export class Logger {
  private outputChannel: OutputChannel;
  constructor(name?: string) {
    this.outputChannel = window.createOutputChannel(name || "Ethcode");
  }
  private getNow(): string {
    const now = Date.now();
    const date = new Date(now * 1000);
    return date.toLocaleTimeString();
  }
  public log(m: string) {
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}]: ${m}`);
    this.outputChannel.show();
  }
  public error(e: Error) {
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}] Error: ${e.message}`);
    this.outputChannel.appendLine(`[${now}] stack: ${e.stack}`);
    this.outputChannel.show();
    errorToast(`Error: ${e.message}`);
  }
  public success(m: string) {
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}]: ${m}`);
    this.outputChannel.show();
    successToast(m);
  }
}
