// paymaster for ERC4337
import { ERC4337VerifyPaymaterType } from "../../types";

export const ERC4337VerifyPaymaster: ERC4337VerifyPaymaterType = {
  UserOption:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/UserOperation.sol",
  IStakeManager:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IStakeManager.sol",
  IPaymaster:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IPaymaster.sol",
  IEntrypoint:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IEntryPoint.sol",
  IAggregator:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/interfaces/IAggregator.sol",
  VerifyingPaymaster:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/samples/VerifyingPaymaster.sol",
  BasePaymaster:
    "https://raw.githubusercontent.com/eth-infinitism/account-abstraction/develop/contracts/core/BasePaymaster.sol",
};

export const VerifyPaymasterMessages = {
  UserOperation: "UserOption contract is created successfully.",
  IStakeManager: "IStakeManager interface is created successfully.",
  IPaymaster: "IPaymaster interface is created successfully.",
  IEntryPoint: "IPaymaster interface is created successfully.",
  IAggregator: "IPaymaster interface is created successfully.",
  VerifyingPaymaster: "VerifyingPaymaster contract is created successfully.",
  BasePaymaster: "BasePaymaster contract is created successfully.",
};
