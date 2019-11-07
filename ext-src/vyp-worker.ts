// @ts-ignore
import * as shell from "shelljs";

function compileVyper(contractFile: any) {
    var args: string = "vyper " + contractFile;
    var escaped = shell.exec(args);
    var m: object = {
        "message": "compilation success",
        "compiled": escaped
    }
    // @ts-ignore
    process.send(m);
}

// @ts-ignore
process.on('message', (m) => {
    if(m.command == "compile") {
        compileVyper(m.File);
    }
})