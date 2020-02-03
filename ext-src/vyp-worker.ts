// @ts-ignore
import * as shell from "shelljs";
import * as fs from "fs";
import { ISources } from "./types";

function compileVyper(sources: ISources) {
    const input_json = {
        "language": "Vyper",
        "sources": sources,
        "settings": {
            "evmVersion": "byzantium",
            "outputSelection": {
                "*": ["evm.bytecode", "abi", "ast"],
            }
        },
    };
    shell.config.execPath = shell.which('node').toString();
    fs.writeFileSync(__dirname + "/" + ".temp-vy.json", JSON.stringify(input_json, null, 4), 'UTF-8');
    const args: string = "vyper-json " + __dirname + "/" + ".temp-vy.json";
    const { stdout, stderr, code } = shell.exec(args);
    var m: object;
    if(stdout) {
        m = { "compiled": stdout }
    }
    if(stderr) {
        m = { "error": stderr +" "+ code }
    }
    fs.unlink(__dirname + "/" + ".temp-vy.json", () => {});
    // @ts-ignore
    process.send(m);
}

// @ts-ignore
process.on('message', (m) => {
    if (m.command == "compile") {
        compileVyper(m.source);
    }
})