// @ts-ignore
import * as solc from "solc";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import { RemixURLResolver } from "remix-url-resolver";
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
const EthereumTx = require('ethereumjs-tx')
import { sha3 } from './hash/sha3';

// console.log("ETHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh: ")
// console.log(w3.eth.accounts);

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

} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

function handleLocal(pathString: string, filePath: any) {
  // if no relative/absolute path given then search in node_modules folder
  if (
    pathString &&
    pathString.indexOf(".") !== 0 &&
    pathString.indexOf("/") !== 0
  ) {
    // return handleNodeModulesImport(pathString, filePath, pathString)
    return;
  } else {
    const o = { encoding: "UTF-8" };
    const p = pathString
      ? path.resolve(pathString, filePath)
      : path.resolve(pathString, filePath);
    const content = fs.readFileSync(p, o);
    return content;
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
        return /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?(\w+\.sol)/g.exec(
          url
        );
      },
      handle: (match: Array<string>) => {
        return handleLocal(match[2], match[3]);
      }
    }
  ];
  // @ts-ignore
  const urlResolver = new RemixURLResolver();
  urlResolver
    .resolve(path, FSHandler)
    .then((data: any) => {
      // @ts-ignore
      process.send({ data, path });
    })
    .catch((e: Error) => {
      throw e;
    });
}

function deployUnsignedTx(meta: any, tx: any, privateKey: any) {
  const unsignedTransaction = new EthereumTx(tx)
  unsignedTransaction.sign(privateKey)
  const rlpEncoded = unsignedTransaction.serialize().toString('hex');
  const rawTransaction = '0x' + rlpEncoded;
  var transactionHash = sha3(rawTransaction);
  var finalTransaction = {
    messageHash: '0x' + Buffer.from(unsignedTransaction.hash(false)).toString('hex'),
    v: '0x' + Buffer.from(unsignedTransaction.v).toString('hex'),
    r: '0x' + Buffer.from(unsignedTransaction.r).toString('hex'),
    s: '0x' + Buffer.from(unsignedTransaction.s).toString('hex'),
    rawTransaction: rawTransaction,
    transactionHash: transactionHash
  };
  // @ts-ignore
  process.send({ responses: finalTransaction });

  const callData = {
    signedTX: JSON.stringify(finalTransaction)
  }
  const resp = client_call_client.DeploySignedTransaction(callData, meta, (err: any, transactionReceipt: any) => {
    if (err) {
      console.log("err", err);
    } else {
      // @ts-ignore
      process.send({ deployedResult: transactionReceipt });
    }
  });
  resp.on('data', (data: any) => {
    const transactionReceipt = JSON.parse(data.txReciept);
    // @ts-ignore
    process.send({ deployedResult: transactionReceipt });
  });
  resp.on('end', function () {
    process.exit(0);
  });
  resp.on('error', function (err: Error) {
    // @ts-ignore
    process.send({ "error": err });
  });
}

process.on("message", async m => {

  var meta = new grpc.Metadata();
  meta.add('authorization', m.jwtToken);
  if (m.command === "compile") {
    const input = m.payload;
    if (m.version === 'latest') {
      try {
        const output = await solc.compile(JSON.stringify(input), findImports);
        // @ts-ignore
        process.send({ compiled: output });
      } catch (e) {
        // @ts-ignore
        process.send({ error: e });
      }
    }
    solc.loadRemoteVersion(m.version, async (err: Error, newSolc: any) => {
      if (err) {
        // @ts-ignore
        process.send({ error: e });
      } else {
        try {
          const output = await newSolc.compile(
            JSON.stringify(input),
            findImports
          );
          // @ts-ignore
          process.send({ compiled: output });
        } catch (e) {
          // @ts-ignore
          process.send({ error: e });
        }
      }
    });
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
      });
  }
  if (m.command === "run-test") {
    // TODO: move parsing to extension.ts
    // const sources = JSON.parse(m.payload);
    const rt = {
      testInterface: {
        command: 'run-test-sources',
        payload: m.payload
      }
    }
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
    }
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
      const result = JSON.parse(data.result);
      // @ts-ignore
      process.send({ accounts: result.accounts, balance: result.balance });
    })
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
        console.log("err", err);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ transactionResult: data.result });
    })
  }
  // fetch balance of a account
  if (m.command === "get-balance") {
    const c = {
      callInterface: {
        command: 'get-balance',
        payload: m.account
      }
    }
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
    })
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
    // @ts-ignore
    process.send({ help: m.jwtToken });
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
    })
  }
  // custom Deploy
  if (m.command === "custom-deploy-contract") {
    if (m.jwtToken) {
      // @ts-ignore
      process.send({ jwtToken: m.jwtToken });
    }
    const { abi, bytecode, params, gasSupply, pvtKey, from, to } = m.payload;
    // var pvtKey = "73b38bdffb3b16b16192bc5d21aed4ef561e0e66bec4c8eae1cd4d350fae06b5";
    const privateKey = Buffer.from(
      pvtKey,
      'hex',
    )
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
    // @ts-ignore
    process.send({ help: m.jwtToken });
    const call = client_call_client.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log("err", err);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      var rawTX = JSON.parse(data.result);
      rawTX['from'] = from;
      rawTX['to'] = to;
      deployUnsignedTx(meta, rawTX, privateKey);
      // @ts-ignore
      // process.send({ deployedResult: data.result });
    });
    call.on('end', function () {
      process.exit(0);
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    })
  }
  // Method call
  if (m.command === "contract-method-call") {
    const { abi, address, methodName, params, gasSupply, deployAccount } = m.payload;
    const inp = {
      abi,
      address,
      methodName,
      params,
      gasSupply: (typeof gasSupply) === 'string' ? parseInt(gasSupply) : gasSupply,
      deployAccount
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
    })
  }

  // custom Method call
  if (m.command === "custom-method-call") {
    const { abi, address, methodName, params, gasSupply, deployAccount, pvtKey, from } = m.payload;
    // var pvtKey = "73b38bdffb3b16b16192bc5d21aed4ef561e0e66bec4c8eae1cd4d350fae06b5";
    const privateKey = Buffer.from(
      pvtKey,
      'hex',
    )
    const inp = {
      abi,
      address,
      methodName,
      params,
      gasSupply: (typeof gasSupply) === 'string' ? parseInt(gasSupply) : gasSupply,
      deployAccount
    };
    const c = {
      callInterface: {
        command: 'custom-method-call',
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
      var rawTX = JSON.parse(data.result);
      rawTX['from'] = from;
      rawTX['to'] = address;
      deployUnsignedTx(meta, rawTX, privateKey);
      // @ts-ignore
      // process.send({ deployedResult: data.result });
    });
    call.on('end', function () {
      process.exit(0);
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    })
  }
  // Gas Estimate
  if (m.command === "get-gas-estimate") {
    const { abi, bytecode, params } = m.payload;
    const inp = {
      abi,
      bytecode,
      params
    }
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
    // @ts-ignore
    process.send({ message: "BEFORE" });
    const call = remix_debug_client.RunDebug(dt);
    // @ts-ignore
    process.send({ message: "AFTER" });
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
  if (m.command == "create-Account") {
    const payload = JSON.parse(m.payload)
    const c = {
      to: payload.to,
      from: payload.from,
      data: payload.data,
      value: payload.value,
      gas: payload.gas
    };
    // const pvtKey = "73b38bdffb3b16b16192bc5d21aed4ef561e0e66bec4c8eae1cd4d350fae06b5";
    const privateKey = Buffer.from(
      payload.pvtKey,
      'hex',
    )
    // const c = {
    //   to: "0x05e26fcE6c34f17D59897Bcb7e82eBa1372A7f83",
    //   // data: Web3.utils.utf8ToHex("Hello"),
    //   data: "",
    //   value: 27,
    //   gas: 97000
    // };
    const call = client_call_client.CreateRawTransaction(JSON.stringify(c), meta, (err: any, responses: any) => {
      if (err) {
        console.log("err", err);
      } else {
        deployUnsignedTx(meta, responses.rawTX, privateKey);
      }
    });
    call.on('end', function () {
      process.exit(0);
    });
    call.on('error', function (err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }
});
