export interface ISource {
  content: string | undefined;
}
export interface ISources {
  [key: string]: ISource;
}
export interface IAccount {
  label: string;
  value: string;
  pubAddr?: string;
  checksumAddr?: string;
}

export type LocalAddressType = {
  pubAddress: string;
  checksumAddress: string;
};

export interface TokenData {
  appId?: string;
  token?: string;
  email?: string;
}

export interface ICompilationResult {
  source: {
    target: string;
    sources: ISources;
  };
  data: any;
}
