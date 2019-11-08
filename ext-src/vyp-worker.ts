// @ts-ignore
import * as shell from "shelljs";
import * as fs from "fs";
import { ISources } from "./types";

function compileVyper(source: ISources) {
    var input_json = {
        "language": "Vyper",
        "sources": source,
        "settings": {
            "evmVersion": "byzantium"
        },
        "outputSelection": {
            "*": ["evm.bytecode", "abi"],
            // @ts-ignore
            [source.fn]: ["ast"]
        }
    };
    fs.writeFileSync(__dirname + "/" + "temp-vy.json", JSON.stringify(input_json, null, 4), 'UTF-8');
    var args: string = "vyper-json " + __dirname + "/" + "temp-vy.json";
    var escaped = shell.exec(args);
    var m: object = {
        "message": "compilation success",
        "compiled": escaped
    }
    // fs.unlink("temp-vy.json", ()=>{});
    // @ts-ignore
    process.send(m);
}

// @ts-ignore
process.on('message', (m) => {
    if (m.command == "compile") {
        compileVyper(m.src);
    }
})