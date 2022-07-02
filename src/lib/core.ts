import { window, ExtensionContext, InputBoxOptions } from 'vscode';
import { logger } from './index';
import { ConstructorInputValue, CompiledJSONOutput } from '../types';
import { getAbi, getByteCode } from '../types/output';

// Create logger
const pwdInpOpt: InputBoxOptions = {
  ignoreFocusOut: true,
  password: true,
  placeHolder: 'Password',
};
const txHashInpOpt: InputBoxOptions = {
  ignoreFocusOut: true,
  password: false,
  placeHolder: 'Transaction hash',
};

// Estimate Transaction Gas
export function estimateTransactionGas(context: ExtensionContext): Promise<number> {
  return new Promise((resolve, reject) => {
    // const networkId = context.workspaceState.get('networkId');
    // const account: string | undefined = context.workspaceState.get('account');
    // const contract = context.workspaceState.get('contract') as CompiledJSONOutput;
    // const params: Array<ConstructorInputValue> | undefined = context.workspaceState.get('constructor-inputs');
    // let payload = {};
    // payload = {
    //   abi: getAbi(contract),
    //   bytecode: getByteCode(contract),
    //   params: params || [],
    //   from: account,
    // };
/*
    const txWorker = createWorker();
    txWorker.on('message', (m: any) => {
      if (m.error) {
        logger.error(m.error);
        reject(m.error);
      } else {
        context.workspaceState.update('gasEstimate', m.gasEstimate);
        logger.log(m.gasEstimate);
        resolve(m.gasEstimate);
      }
    });
    logger.log('Transaction payload');
    logger.log(JSON.stringify(payload, null, 2));
    txWorker.send({
      command: 'get-gas-estimate',
      payload,
      testnetId: networkId,
    });*/
  });
}

// Ganache deploy
export function ganacheDeploy(context: ExtensionContext): Promise<any> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        // const testNetId = context.workspaceState.get('networkId');
        // const account = context.workspaceState.get('account');
        // const contract = context.workspaceState.get('contract') as CompiledJSONOutput;
        // const params: Array<ConstructorInputValue> | undefined = context.workspaceState.get('constructor-inputs');
        // const gas: number | undefined = context.workspaceState.get('gasEstimate');
        // let payload = {};
        // payload = {
        //   abi: getAbi(contract),
        //   bytecode: getByteCode(contract),
        //   params: params || [],
        //   from: account,
        //   gas,
        // };
/*
        const deployWorker = createWorker();
        deployWorker.on('message', (m: any) => {
          logger.log(`SignDeploy worker message: ${JSON.stringify(m)}`);
          if (m.error) {
            logger.error(m.error);
          } else if (m.transactionResult) {
            logger.log('Contract transaction submitted!');
            resolve(m.transactionResult);
          }
        });

        deployWorker.send({
          command: 'deploy-contract',
          payload,
          testnetId: testNetId,
        });*/
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })();
  });
}

export function signDeploy(context: ExtensionContext): Promise<any> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const testNetId = context.workspaceState.get('networkId');
        const account = context.workspaceState.get('account');
        const unsignedTx = context.workspaceState.get('unsignedTx');
        const password = await window.showInputBox(pwdInpOpt);
       /* const accWorker = createAccWorker();
        const signedDeployWorker = createWorker();
        accWorker.on('message', (m: any) => {
          if (m.privateKey) {
            const { privateKey } = m;
            signedDeployWorker.on('message', (m: any) => {
              logger.log(`SignDeploy worker message: ${JSON.stringify(m)}`);
              if (m.error) {
                logger.error(m.error);
                reject(m.error);
              } else if (m.transactionResult) {
                logger.success('Contract transaction submitted!');
                resolve(m.transactionResult);
              }
            });
            signedDeployWorker.send({
              command: 'sign-deploy',
              payload: {
                unsignedTx,
                pvtKey: privateKey,
              },
              testnetId: testNetId,
            });
          } else if (m.error) {
            logger.error(m.error);
            reject(m.error);
          }
        });
        accWorker.send({
          command: 'extract-privateKey',
          address: account,
          keyStorePath: context.extensionPath,
          password: password || '',
        });*/
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })();
  });
}

export function getTransactionInfo(context: ExtensionContext): Promise<any> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const testNetId = context.workspaceState.get('networkId');
        const txhash = context.workspaceState.get('transactionHash') || (await window.showInputBox(txHashInpOpt));
       /* const txWorker = createWorker();
        txWorker.on('message', (m: any) => {
          if (m.error) {
            logger.error(m.error);
            reject(m.error);
          } else {
            context.workspaceState.update('transaction', m.transaction);
            logger.log(m.transaction);
            resolve(m.transaction);
          }
        });
        txWorker.send({
          command: 'get-transaction',
          payload: {
            txhash,
          },
          testnetId: testNetId,
        });*/
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })();
  });
}

export function getTransactionReceipt(context: ExtensionContext): Promise<any> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const testNetId = context.workspaceState.get('networkId');
        const txhash = context.workspaceState.get('transactionHash') || (await window.showInputBox(txHashInpOpt));
        /*const txWorker = createWorker();
        txWorker.on('message', (m: any) => {
          if (m.error) {
            logger.error(m.error);
            reject(m.error);
          } else {
            context.workspaceState.update('transaction-receipt', JSON.parse(m.transactionReceipt));
            logger.log(m.transactionReceipt);
            resolve(m.transactionReceipt);
          }
        });
        txWorker.send({
          command: 'get-transaction-receipt',
          payload: {
            txhash,
          },
          testnetId: testNetId,
        });*/
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })();
  });
}
