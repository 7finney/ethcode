import { window, OutputChannel } from "vscode";
import { errorToast, successToast } from "./utils";

export default class Logger {
  private outputChannel: OutputChannel;

  constructor(name?: string) {
    this.outputChannel = window.createOutputChannel(name || "Ethcode");
  }

  private getNow = (): string => {
    const date = new Date(Date.now());
    return date.toLocaleTimeString();
  };

  public log(...m: Array<any>) {
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
