// @ts-ignore
import * as shell from "shelljs";
import * as fs from "fs";
import { ISources } from "./types";

function compileVyper(sources: ISources) {
    var input_json = {
        "language": "Vyper",
        "sources": sources,
        "settings": {
            "evmVersion": "byzantium"
        },
        "outputSelection": {
            "*": ["evm.bytecode", "abi", "ast"],
        }
    };
    fs.writeFileSync(__dirname + "/" + ".temp-vy.json", JSON.stringify(input_json, null, 4), 'UTF-8');
    var args: string = "vyper-json " + __dirname + "/" + ".temp-vy.json";
    var escaped = shell.exec(args);
    var m: object = {
        "processMessage": "",
        "compiled": escaped
    }
    fs.unlink(__dirname + "/" + ".temp-vy.json", ()=>{});
    // @ts-ignore
    process.send(m);
}

// @ts-ignore
process.on('message', (m) => {
    if (m.command == "compile") {
        compileVyper(m.source);
    }
})