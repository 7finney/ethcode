import { workspace } from 'vscode';
import { TokenData } from '../types';
import { logger } from '../lib';

export function retrieveUserSettings(accessScope: string, valueToRetreive: string): string | undefined {
  return workspace.getConfiguration(accessScope).get(valueToRetreive);
}

const authToken: TokenData = {
  token: retrieveUserSettings('ethcode.userConfig.appRegistration', 'token'),
  appId: retrieveUserSettings('ethcode.userConfig.appRegistration', 'appId'),
};

export async function verifyUserToken(appId: string, email: string, authtoken: string): Promise<boolean> {
  // try {
  //   const r = await axios.post('https://auth.ethcode.dev/user/token/app/verify', {
  //     email,
  //     app_id: appId,
  //     token: authtoken,
  //   });
  //   logger.success(r.data.Status);
  //   if (r.status === 200) {
  //     return true;
  //   }
  //   return false;
  // } catch (error) {
  //   logger.log(JSON.stringify(error));
  //   return false;
  // }
  return false;
}

export async function registerAppToToken() {
  try {
    const appId = retrieveUserSettings('ethcode.userConfig.appRegistration', 'appId');
    const email = retrieveUserSettings('ethcode.userConfig.appRegistration', 'email');
    const token = retrieveUserSettings('ethcode.userConfig.appRegistration', 'token');
    if (appId === '' || email === '' || token === '') {
      logger.log('App Not Registered');
      return false;
    }
    const verified = await verifyUserToken(appId!, email!, token!);
    if (!verified) {
      logger.error(new Error('App token tampered with or revoked'));
      return false;
    }
    authToken.appId = appId!;
    authToken.token = token!;
    return true;
  } catch (e) {
    const error = e as any;
    if (error.code === 'FileNotFound') {
      logger.log("Configuration file doesn't exists");
    }
    return false;
  }
}

export function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
