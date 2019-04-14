// const solc = require('solc');
// @ts-ignore
import * as solc from 'solc';

process.on('message', async (m) => {
    if (m.command === 'compile') {
        try {
            const input = m.payload;
            const output = await solc.compile(JSON.stringify(input));
            // @ts-ignore
            process.send({ compiled: output });
        } catch (e) {
            // @ts-ignore
            process.send({ error: e });
        }
    }
})
module.exports = {};