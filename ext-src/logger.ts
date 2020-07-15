import { window, OutputChannel } from "vscode";
export class Logger {
  outputChannel: OutputChannel;
  constructor(name?: string) {
    this.outputChannel = window.createOutputChannel(name || "Ethcode");
  }
  private getNow(): string {
    const now = Date.now();
    const date = new Date(now * 1000);
    return date.toISOString();
  }
  log(m: string) {
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}]: ${m}`);
    this.outputChannel.show();
  }
  error(e: Error) {
    const now = Date.now();
    this.outputChannel.appendLine(`[${now}] Error: ${e.message}`);
    this.outputChannel.show();
  }
  success(m: string) {
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}]: ${m}`);
    this.outputChannel.show();
  }
}
