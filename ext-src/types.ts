export interface ISource {
    content: string | undefined
}
export interface ISources {
    [key: string]: ISource
}
export interface IAccount {
    label: string;
    value: string;
    pubAddr?: string;
    checksumAddr?: string;
}

export interface TokenData {
    machineID: string;
    token: string;
}