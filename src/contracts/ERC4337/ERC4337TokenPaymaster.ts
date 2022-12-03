// paymaster for ERC4337
import { ERC4337TokenPaymaterType } from "../../types";

export const ERC4337TokenPaymaster: ERC4337TokenPaymaterType = {
  SimpleAccount:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/samples/SimpleAccount.sol",
  BaseAccount:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/core/BaseAccount.sol",
  BasePaymaster:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/core/BasePaymaster.sol",
  TokenPaymaster:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/samples/TokenPaymaster.sol",
  IAccount:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IAccount.sol",
  IEntryPoint:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IEntryPoint.sol",
  IPaymaster:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IPaymaster.sol",
  UserOption:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/UserOperation.sol",
  IStakeManager:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IStakeManager.sol",
  IAggregator:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IAggregator.sol",
};

export const TokenPaymasterMessages = {
  SimpleAccount: "SimpleAccount contract is created successfully.",
  BaseAccount: "BaseAccount contract is created successfully.",
  BasePaymaster: "BasePaymaster contract is created successfully.",
  TokenPaymaster: "TokenPaymaster contract is created successfully.",
  IAccount: "IAccount interface is created successfully.",
  IEntryPoint: "IEntryPoint interface is created successfully.",
  IPaymaster: "IPaymaster interface is created successfully.",
  UserOperation: "UserOption contract is created successfully.",
  IStakeManager: "IStakeManager interface is created successfully.",
  IAggregator: "IPaymaster interface is created successfully.",
};
