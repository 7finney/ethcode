// @ts-ignore
import * as solc from "solc";
import * as path from "path";
import * as fs from "fs";
import axios from "axios";
import { RemixURLResolver } from "remix-url-resolver";
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

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
  remix_tests_client = new remix_tests_pb.RemixTestsService('rtapi.ethcode.dev:50051', grpc.credentials.createInsecure());
} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

// remix-debug grpc
try {
  remix_debug_client = new remix_debug_pb.RemixDebugService('remixdebug.ethcode.dev:50052', grpc.credentials.createInsecure());
} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

// client-call grpc
const client_call_pb = protoDescriptor.eth_client_call;
let client_call_client: any;
try {
  client_call_client = new client_call_pb.ClientCallService('clientcallapi.ethcode.dev:50053', grpc.credentials.createInsecure());
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

process.on("message", async m => {
  if (m.command === "compile") {
    const input = m.payload;
    if(m.version === 'latest') {
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
      if(err) {
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
  if(m.command === "fetch_compiler_verison") {
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
  if(m.command === "run-test") {
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
      if(result.filePath) {
        findImports(result.filePath);
      } else {
        // @ts-ignore
        process.send({ utResp: data });
      }
    });
    call.on('end', function() {
      process.exit(0);
    });
  }
 // Fetch accounts and balance
  if(m.command === "get-accounts") {
    const c = {
      callInterface: {
        command: 'get-accounts',
      }
    }
    const call = client_call_client.RunDeploy(c);
    call.on('data', (data: any) =>{
      // @ts-ignore
      const result = JSON.parse(data.result);
      // @ts-ignore
      process.send({ accounts: result.accounts, balance: result.balance });
    })
  }
  // send wei_value to a address
  if(m.command === "send-ether") {
    const transactionInfo = m.transactionInfo;
    const c = {
      callInterface: {
        command: 'send-ether',
        payload: JSON.stringify(transactionInfo)
      }
    };
    const call = client_call_client.RunDeploy(c);
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ transactionResult: data.result });
    })
  }
  // fetch balance of a account
  if(m.command === "get-balance") {
    const c = {
      callInterface: {
        command: 'get-balance',
        payload: m.account
      }
    }
    const call = client_call_client.RunDeploy(c);
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ balance: data.result });
    })
  }
  // Deploy
  if(m.command === "deploy-contract") {
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
        payload: JSON.stringify(inp)
      }
    };
    const call = client_call_client.RunDeploy(c);
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ deployedResult: data.result });
    });
    call.on('end', function() {
      process.exit(0);
    });
    call.on('error', function(err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    })
  }
  // Method call
  if(m.command === "contract-method-call") {
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
        payload: JSON.stringify(inp)
      }
    };
    const call = client_call_client.RunDeploy(c);
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ callResult: data.result });
    });
    call.on('end', function() {
      process.exit(0);
    });
    call.on('error', function(err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    })
  }
  // Gas Estimate
  if(m.command === "get-gas-estimate") {
    const { abi, bytecode, params } = m.payload;
    const inp = {
      abi,
      bytecode,
      params
    }
    const c = {
      callInterface: {
        command: 'get-gas-estimate',
        payload: JSON.stringify(inp)
      }
    };
    const call = client_call_client.RunDeploy(c);
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ gasEstimate: data.result });
    });
    call.on('error', function(err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }
  // Debug transaction
  if(m.command === "debug-transaction") {
    const dt = {
      debugInterface: {
        command: 'debug',
        payload: m.payload
      }
    };
    const call = remix_debug_client.RunDebug(dt);
    call.on('data', (data: any) => {
      const result = JSON.parse(data.result);
      // @ts-ignore
      process.send({ debugResp: result });
    });
    call.on('end', function() {
      process.exit(0);
    });
    call.on('error', function(err: Error) {
      // @ts-ignore
      process.send({ "error": err });
    });
  }
});
