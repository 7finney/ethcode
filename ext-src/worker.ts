// @ts-ignore
import * as solc from "solc";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import { RemixURLResolver } from "remix-url-resolver";
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
const EthereumTx = require('ethereumjs-tx').Transaction;
import { sha3 } from './hash/sha3';
var formatters = require('web3-core-helpers').formatters;
// import { Logger } from "./logger";
// const logger = new Logger();

const PROTO_PATH = [path.join(__dirname, '../services/remix-tests.proto'), path.join(__dirname, '../services/client-call.proto'), path.join(__dirname, '../services/remix-debug.proto')];
const packageDefinition = protoLoader.loadSync(PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

// remix-tests grpc
const remix_tests_pb = protoDescriptor.remix_tests;
const remix_debug_pb = protoDescriptor.remix_debug;

let remix_tests_client: any;
let remix_debug_client: any;
try {
  remix_tests_client = new remix_tests_pb.RemixTestsService('rt.ethco.de:50051', grpc.credentials.createInsecure());
} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

// remix-debug grpc
try {
  remix_debug_client = new remix_debug_pb.RemixDebugService('rd.ethco.de:50052', grpc.credentials.createInsecure());
} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

// client-call grpc
const client_call_pb = protoDescriptor.eth_client_call;
let client_call_client: any;
try {
  client_call_client = new client_call_pb.ClientCallService('cc.ethco.de:50053', grpc.credentials.createInsecure());
  // client_call_client = new client_call_pb.ClientCallService('cc.staging.ethco.de:50053', grpc.credentials.createInsecure());
  // client_call_client = new client_call_pb.ClientCallService('localhost:50053', grpc.credentials.createInsecure());
} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

function handleLocal(pathString: string, filePath: any) {
  // if no relative/absolute path given then search in node_modules folder
  if (pathString && pathString.indexOf(".") !== 0 && pathString.indexOf("/") !== 0) {
    console.error("Error: Node Modules Import is not implemented yet!");
    // return handleNodeModulesImport(pathString, filePath, pathString)
    return;
  } else {
    try {
      const o = { encoding: "UTF-8" };
      // hack for compiler imports to work (do not change)
      const p = pathString ? path.resolve(pathString, filePath) : path.resolve(pathString, filePath);
      const content = fs.readFileSync(p, o);
      return content;
    } catch (error) {
      // @ts-ignore
      process.send({ error });
      throw error;
    }
  }
}

function findImports(path: any) {
  // TODO: We need current solc file path here for relative local import
  // @ts-ignore
  process.send({ processMessage: "importing file: " + path });
  const FSHandler = [
    {
      type: "local",
      match: (url: string) => {
        return /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?(\w+\.sol)/g.exec(url);
      },
      handle: (match: Array<string>) => {
        return handleLocal(match[2], match[3]);
      }
    }
  ];
  // @ts-ignore
  const urlResolver = new RemixURLResolver();
  // this section usually executes after solc returns error file not found
  urlResolver.resolve(path, FSHandler)
    .then((data: any) => {
      // @ts-ignore
      process.send({ data, path });
    })
    .catch((e: Error) => {
      // @ts-ignore
      process.send({ error: e });
    });
    return { 'error': 'Deferred import' };
}

// sign an unsigned raw transaction and deploy
function deployUnsignedTx(meta: any, tx: any, privateKey: any, testnetId?: any) {
  // TODO: error handling
  tx = JSON.parse(tx);
  const txData = formatters.inputTransactionFormatter(tx);
  // TODO: this method should not work for ganache and prysm and throw error
  const chainId = Number(testnetId) === 5 ? 6284 : Number(testnetId)
  const unsignedTransaction = new EthereumTx({
    from: txData.from || '0x',
    nonce: txData.nonce || '0x',
    gasPrice: txData.gasPrice,
    gas: txData.gas || '0x',
    to: txData.to || '0x',
    value: txData.value || '0x',
    data: txData.data || '0x'
  }, { chain: chainId });
  const pvtk = Buffer.from(privateKey, 'hex');
  unsignedTransaction.sign(pvtk);
  const rlpEncoded = unsignedTransaction.serialize().toString('hex');
  const rawTransaction = '0x' + rlpEncoded;
  var transactionHash = sha3(rawTransaction);
  // @ts-ignore
  process.send({ responses: transactionHash });

  const c = {
    callInterface: {
      command: "deploy-signed-tx",
      payload: rawTransaction,
      testnetId
    }
  };

  const call = client_call_client.RunDeploy(c, meta, (err: any) => {
    if (err) {
      console.error(err);
    }
  });


  call.on('data', (data: any) => {
    // @ts-ignore
    process.send({ transactionResult: data.result });
  });
  call.on('end', function () {
    process.exit(0);
  });
  call.on('error', function (err: Error) {
    // @ts-ignore
    process.send({ "error": err });
  });
}

process.on("message", async m => {
  var meta = new grpc.Metadata();
  meta.add('authorization', m.jwtToken);
  if (m.command === "compile") {
    const vnReg = /(^[0-9].[0-9].[0-9]\+commit\..*?)+(\.)/g;
    const vnRegArr = vnReg.exec(solc.version());
    // @ts-ignore
    const vn = 'v' + (vnRegArr ? vnRegArr[1] : '');
    const input = m.payload;
    if (m.version === vn || m.version === 'latest') {
      try {
        console.log("compiling with local version: ", solc.version());
        const output = await solc.compile(JSON.stringify(input), { import: findImports });
        // @ts-ignore
        process.send({ compiled: output });
        // we should not exit process here as findImports still might be running
      } catch (e) {
          console.error(e);
          // @ts-ignore
          process.send({ error: e });
          // @ts-ignore
          process.exit(1);
      }
    } else if (m.version !== vn) {
        console.log("loading remote version " + m.version + "...");
        solc.loadRemoteVersion(m.version, async (err: Error, newSolc: any) => {
          if (err) {
            console.error(err);
            // @ts-ignore
            process.send({ error: e });
          } else {
            console.log("compiling with remote version ", newSolc.version());
            try {
              const output = await newSolc.compile(JSON.stringify(input), { import: findImports });
              // @ts-ignore
              process.send({ compiled: output });
            } catch (e) {
              console.error(e);
              // @ts-ignore
              process.send({ error: e });
              // @ts-ignore
              process.exit(1);
            }
          }
        });
    }
  }
  if (m.command === "fetch_compiler_verison") {
    axios
      .get("https://ethereum.github.io/solc-bin/bin/list.json")
      .then((res: any) => {
        // @ts-ignore
        process.send({ versions: res.data });
      })
      .catch((e: Error) => {
        // @ts-ignore
        process.send({ error: e });
        // @ts-ignore
        process.exit(1);
      });
  }
  if (m.command === "run-test") {
    // TODO: move parsing to extension.ts
    const rt = {
      testInterface: {
        command: 'run-test-sources',
        payload: m.payload
      }
    };
    const call = remix_tests_client.RunTests(rt);
    call.on('data', (data: any) => {
      const result = JSON.parse(data.result);
      if (result.filePath) {
        findImports(result.filePath);
      } else {
        // @ts-ignore
        process.send({ utResp: data });
      }
    });
    call.on('end', function () {
      process.exit(0);
    });
  }
  // Fetch accounts and balance
  if (m.command === "get-accounts") {
    const c = {
      callInterface: {
        command: 'get-accounts'
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log("err", err);
        // @ts-ignore
        process.exit(1);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });


    call.on('data', (data: any) => {
      // @ts-ignore
      const result = JSON.parse(data.result);
      // @ts-ignore
      process.send({ accounts: result.accounts, balance: result.balance });
    });
  }
  // send wei value to address in other testnets
  if (m.command == "send-ether-signed") {
    const { transactionInfo, pvtKey } = m.payload;
    const c = {
      callInterface: {
        command: 'build-raw-eth-tx',
        payload: JSON.stringify(transactionInfo),
        testnetId: m.testnetId
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any) => {
      if (err) {
        console.error("err", err);
        // @ts-ignore
        process.send({ error: err });
        // @ts-ignore
        process.exit(1);
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ unsignedTx: data.result });
      deployUnsignedTx(meta, data.result, pvtKey, m.testnetId);
    });
    call.on('error', function (err: Error) {
      console.log(err);
      
      // @ts-ignore
      process.send({ error: err });
      // @ts-ignore
      process.exit(1);
    });
  }
  // send wei_value to a address
  if (m.command === "send-ether") {
    const transactionInfo = m.transactionInfo;
    const c = {
      callInterface: {
        command: 'send-ether',
        payload: JSON.stringify(transactionInfo),
        testnetId: m.testnetId
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.error("error", err);
        // @ts-ignore
        process.send({ error: err });
        // @ts-ignore
        process.exit(1);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ transactionResult: data.result });
    });
  }
  // fetch balance of a account
  if (m.command === "get-balance") {
    const hashAddr = m.account.checksumAddr ? m.account.checksumAddr : m.account.value;
    const c = {
      callInterface: {
        command: 'get-balance',
        payload: hashAddr,
        testnetId: m.testnetId
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log("err", err);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ balance: data.result });
    });
  }
  // Deploy
  if (m.command === "deploy-contract") {
    if (m.jwtToken) {
      // @ts-ignore
      process.send({ jwtToken: m.jwtToken });
    }
    const { abi, bytecode, params, gasSupply } = m.payload;
    const inp = {
      abi,
      bytecode,
      params,
      gasSupply: (typeof gasSupply) === 'string' ? parseInt(gasSupply) : gasSupply
    };
    const c = {
      callInterface: {
        command: 'deploy-contract',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log("err", err);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ deployedResult: data.result });
    });
    call.on('end', function () {
      process.exit(0);
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }
  // Method call
  if (m.command === "ganache-contract-method-call") {
    const { abi, address, methodName, params, gasSupply, deployAccount, value } = m.payload;
    const inp = {
      abi,
      address,
      methodName,
      params,
      gasSupply: (typeof gasSupply) === 'string' ? parseInt(gasSupply) : gasSupply,
      deployAccount,
      value
    };
    const c = {
      callInterface: {
        command: 'ganache-contract-method-call',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log("err", err);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ callResult: data.result });
    });
    call.on('end', function () {
      process.exit(0);
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }

  // testnet method call
  if (m.command === "contract-method-call") {
    const { from, abi, address, methodName, params, gasSupply, value } = m.payload;
    const inp = {
      from,
      abi,
      address,
      methodName,
      params,
      gasSupply: (typeof gasSupply) === 'string' ? parseInt(gasSupply) : gasSupply,
      value
    };
    const c = {
      callInterface: {
        command: 'contract-method-call',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log("err", err);
        // @ts-ignore
        process.send({ error: err });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ callResult: data.result });
      // TODO: only send to unsignedTx is data.result is a transaction
      // @ts-ignore
      process.send({ unsignedTx: data.result });
    });
    call.on('end', function () {
      process.exit(0);
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }
  // Gas Estimate
  if (m.command === "get-gas-estimate") {
    const { abi, bytecode, params } = m.payload;
    const inp = { abi, bytecode, params };
    const c = {
      callInterface: {
        command: 'get-gas-estimate',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log("err", err);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ gasEstimate: data.result });
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }
  // Debug transaction
  if (m.command === "debug-transaction") {
    const dt = {
      debugInterface: {
        command: 'debug',
        payload: m.payload,
        testnetId: m.testnetId
      }
    };
    const call = remix_debug_client.RunDebug(dt);
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ debugResp: data.result });
    });
    call.on('end', function () {
      process.exit(0);
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }
  // Build raw transaction for contract creation
  if (m.command == "build-rawtx") {
    const { abi, bytecode, params, gasSupply, from } = m.payload;
    const inp = {
      from,
      abi,
      bytecode,
      params,
      gasSupply
    };
    const c = {
      callInterface: {
        command: 'build-rawtx',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId
      }
    };
    const call = client_call_client.RunDeploy(c, meta, (err: any) => {
      if (err) {
        console.error("err", err);
        // @ts-ignore
        process.send({ "error": err });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ buildTxResult: data.result });
    });
    call.on('end', function () {
      process.exit(0);
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }
  // sign and deploy unsigned transaction
  if (m.command == "sign-deploy") {
    const { unsignedTx, pvtKey } = m.payload;
    deployUnsignedTx(meta, unsignedTx, pvtKey, m.testnetId);
  }
});
