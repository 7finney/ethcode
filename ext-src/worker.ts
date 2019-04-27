// @ts-ignore
import * as solc from "solc";

function findImports(path: any) {
  // TODO: We need current solc file path here for relative local import
  // @ts-ignore
  process.send({ path });
}

process.on("message", async m => {
  if (m.command === "compile") {
    try {
      const input = m.payload;
      const output = await solc.compile(JSON.stringify(input), findImports);
      // @ts-ignore
      process.send({ compiled: output });
    } catch (e) {
      // @ts-ignore
      process.send({ error: e });
    }
  }
});
