import { workspace, ConfigurationTarget } from 'vscode';
import { logger } from './logger';

export function updateUserSession(valueToAssign: any, keys: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore
      const config = workspace.getConfiguration('ethcode', workspace.workspaceFolders[0].uri);
      if (keys.length === 2) {
        const userSession = `${keys[0]}.${keys[1]}`;
        config.update(userSession, valueToAssign);
        resolve(userSession);
        // @ts-ignore
      } else if (keys.length === 3) {
        const userSession = `${keys[0]}.${keys[1]}.${keys[2]}`;
        // @ts-ignore
        config.update(userSession, valueToAssign);
        resolve(userSession);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export async function updateUserSettings(accessScope: string, valueToAdd: string): Promise<boolean> {
  try {
    await workspace.getConfiguration('ethcode').update(accessScope, valueToAdd, ConfigurationTarget.Global);
    return true;
  } catch (e) {
    logger.log('Error updating: ', e);
    return false;
  }
}
