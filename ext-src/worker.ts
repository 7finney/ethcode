// @ts-ignore
import * as path from 'path';
import * as fs from 'fs';
import { RemixURLResolver } from 'remix-url-resolver';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { sha3 } from './hash/sha3';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const EthereumTx = require('ethereumjs-tx').Transaction;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { formatters } = require('web3-core-helpers');

const PROTO_PATH = [
  path.join(__dirname, '../services/remix-tests.proto'),
  path.join(__dirname, '../services/client-call.proto'),
  path.join(__dirname, '../services/remix-debug.proto'),
];
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

// remix-tests grpc
const remixTestsPB = protoDescriptor.remix_tests;
const remixDebugPB = protoDescriptor.remix_debug;

let remixTestsClient: any;
let remixDebugClient: any;
try {
  remixTestsClient = new remixTestsPB.RemixTestsService('rt.ethco.de:50051', grpc.credentials.createInsecure());
} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

// remix-debug grpc
try {
  remixDebugClient = new remixDebugPB.RemixDebugService('rd.ethco.de:50052', grpc.credentials.createInsecure());
} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

// client-call grpc
const clientCallPB = protoDescriptor.eth_client_call;
let clientCallClient: any;
try {
  clientCallClient = new clientCallPB.ClientCallService('cc.ethcode.dev:50053', grpc.credentials.createInsecure());
  // clientCallClient = new clientCallPB.ClientCallService('192.168.1.116:50053', grpc.credentials.createInsecure());
} catch (e) {
  // @ts-ignore
  process.send({ error: e });
}

// sign an unsigned raw transaction and deploy
function deployUnsignedTx(meta: any, tx: any, privateKey: any, testnetId?: any) {
  try {
    // eslint-disable-next-line no-param-reassign
    tx = JSON.parse(tx);
    const txData = formatters.inputTransactionFormatter(tx);
    const chainId = Number(testnetId);
    const unsignedTransaction = new EthereumTx(
      {
        from: txData.from || '0x',
        nonce: txData.nonce || '0x',
        gasPrice: txData.gasPrice,
        gas: txData.gas || '0x',
        to: txData.to || '0x',
        value: txData.value || '0x',
        data: txData.data || '0x',
      },
      { chain: chainId }
    );
    const pvtk = Buffer.from(privateKey, 'hex');
    unsignedTransaction.sign(pvtk);
    const rlpEncoded = unsignedTransaction.serialize().toString('hex');
    const rawTransaction = `0x${rlpEncoded}`;
    const transactionHash = sha3(rawTransaction);
    // @ts-ignore
    process.send({ responses: transactionHash });
    const c = {
      callInterface: {
        command: 'deploy-signed-tx',
        payload: rawTransaction,
        testnetId,
      },
    };

    const call = clientCallClient.RunDeploy(c, meta, (err: any) => {
      if (err) {
        console.error(err);
      }
    });

    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ transactionResult: data.result });
    });
    call.on('error', (err: Error) => {
      // @ts-ignore
      process.send({ error: err });
    });
  } catch (error) {
    console.log(error);
    // @ts-ignore
    process.send({ error: error.message });
  }
}

process.on('message', async (m) => {
  const meta = new grpc.Metadata();
  if (m.authToken) {
    meta.add('token', m.authToken.token);
    meta.add('appId', m.authToken.appId);
  }
  // Fetch accounts and balance
  if (m.command === 'get-accounts') {
    const c = {
      callInterface: {
        command: 'get-accounts',
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log('err', err);
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
  if (m.command === 'send-ether-signed') {
    const { transactionInfo, pvtKey } = m.payload;
    const c = {
      callInterface: {
        command: 'build-raw-eth-tx',
        payload: JSON.stringify(transactionInfo),
        testnetId: m.testnetId,
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any) => {
      if (err) {
        console.error('err', err);
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
    call.on('error', (err: Error) => {
      // @ts-ignore
      process.send({ error: err });
      // @ts-ignore
      process.exit(1);
    });
  }
  // send wei_value to a address
  if (m.command === 'send-ether') {
    const { transactionInfo } = m;
    const c = {
      callInterface: {
        command: 'send-ether',
        payload: JSON.stringify(transactionInfo),
        testnetId: m.testnetId,
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
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
  if (m.command === 'get-balance') {
    const hashAddr = m.account.checksumAddr ? m.account.checksumAddr : m.account.value;
    const c = {
      callInterface: {
        command: 'get-balance',
        payload: hashAddr,
        testnetId: m.testnetId,
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        // @ts-ignore
        process.send({ error: err });
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
  if (m.command === 'deploy-contract') {
    if (m.authToken) {
      // @ts-ignore
      process.send({ authToken: m.authToken });
    }
    const { from, abi, bytecode, params, gasSupply } = m.payload;
    const inp = {
      from,
      abi,
      bytecode,
      params,
      gasSupply: typeof gasSupply === 'string' ? parseInt(gasSupply, 10) : gasSupply,
    };
    const c = {
      callInterface: {
        command: 'deploy-contract',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId,
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        // @ts-ignore
        process.send({ error: err });
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ deployedResult: data.result });
    });
    call.on('end', () => {
      process.exit(0);
    });
    call.on('error', (err: Error) => {
      // @ts-ignore
      process.send({ error: err });
    });
  }
  // Method call
  if (m.command === 'ganache-contract-method-call') {
    const { from, abi, address, methodName, params, gasSupply, deployAccount, value } = m.payload;
    const inp = {
      from,
      abi,
      address,
      methodName,
      params,
      gasSupply: typeof gasSupply === 'string' ? parseInt(gasSupply, 10) : gasSupply,
      deployAccount,
      value,
    };
    const c = {
      callInterface: {
        command: 'ganache-contract-method-call',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId,
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        console.log('err', err);
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ callResult: data.result });
    });
    call.on('end', () => {
      process.exit(0);
    });
    call.on('error', (err: Error) => {
      // @ts-ignore
      process.send({ error: err });
    });
  }

  // testnet method call
  if (m.command === 'contract-method-call') {
    const { from, abi, address, methodName, params, gasSupply, value } = m.payload;
    const inp = {
      from,
      abi,
      address,
      methodName,
      params,
      gasSupply: typeof gasSupply === 'string' ? parseInt(gasSupply, 10) : gasSupply,
      value,
    };
    const c = {
      callInterface: {
        command: 'contract-method-call',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId,
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any) => {
      if (err) {
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
    call.on('end', () => {
      process.exit(0);
    });
    call.on('error', (err: Error) => {
      // @ts-ignore
      process.send({ error: err });
    });
  }
  // Gas Estimate
  if (m.command === 'get-gas-estimate') {
    const { abi, bytecode, params, from } = m.payload;
    const inp = { abi, bytecode, params, from };
    const c = {
      callInterface: {
        command: 'get-gas-estimate',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId,
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any, response: any) => {
      if (err) {
        // @ts-ignore
        process.send({ error: err });
      } else {
        // @ts-ignore
        process.send({ response });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ gasEstimate: data.result });
    });
    call.on('error', (err: Error) => {
      // @ts-ignore
      process.send({ error: err });
    });
  }
  // Debug transaction
  if (m.command === 'debug-transaction') {
    const dt = {
      debugInterface: {
        command: 'debug',
        payload: m.payload,
        testnetId: m.testnetId,
      },
    };
    const call = remixDebugClient.RunDebug(dt);
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ debugResp: data.result });
    });
    call.on('end', () => {
      process.exit(0);
    });
    call.on('error', (err: Error) => {
      // @ts-ignore
      process.send({ error: err });
    });
  }
  // Build raw transaction for contract creation
  if (m.command === 'build-rawtx') {
    const { abi, bytecode, params, gasSupply, from } = m.payload;
    const inp = {
      from,
      abi,
      bytecode,
      params,
      gasSupply,
    };
    const c = {
      callInterface: {
        command: 'build-rawtx',
        payload: JSON.stringify(inp),
        testnetId: m.testnetId,
      },
    };
    const call = clientCallClient.RunDeploy(c, meta, (err: any) => {
      if (err) {
        console.error('err', err);
        // @ts-ignore
        process.send({ error: err });
      }
    });
    call.on('data', (data: any) => {
      // @ts-ignore
      process.send({ buildTxResult: data.result });
    });
    // call.on('end', function () {
    //   process.exit(0);
    // });
    call.on('error', (err: Error) => {
      // @ts-ignore
      process.send({ error: err });
    });
  }
  // sign and deploy unsigned transaction
  if (m.command === 'sign-deploy') {
    const { unsignedTx, pvtKey } = m.payload;
    deployUnsignedTx(meta, unsignedTx, pvtKey, m.testnetId);
  }
});
