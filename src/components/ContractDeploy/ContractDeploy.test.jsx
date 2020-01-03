import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import ReduxThunk from 'redux-thunk'
import reducer from "../../reducers";

import ContractDeploy from './ContractDeploy';

const store = createStore(reducer, {}, applyMiddleware(ReduxThunk));

const compiled = {
  "contracts": {
    "/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol": {
      "Strings": {
        "abi": [
          {
            "constant": true,
            "inputs": [

            ],
            "name": "get",
            "outputs": [
              {
                "name": "res",
                "type": "string"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          }
        ],
        "devdoc": {
          "methods": {

          }
        },
        "evm": {
          "assembly": "    /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":25:136  contract Strings {... */\n  mstore(0x40, 0x80)\n  callvalue\n    /* \"--CODEGEN--\":8:17   */\n  dup1\n    /* \"--CODEGEN--\":5:7   */\n  iszero\n  tag_1\n  jumpi\n    /* \"--CODEGEN--\":30:31   */\n  0x00\n    /* \"--CODEGEN--\":27:28   */\n  dup1\n    /* \"--CODEGEN--\":20:32   */\n  revert\n    /* \"--CODEGEN--\":5:7   */\ntag_1:\n    /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":25:136  contract Strings {... */\n  pop\n  dataSize(sub_0)\n  dup1\n  dataOffset(sub_0)\n  0x00\n  codecopy\n  0x00\n  return\nstop\n\nsub_0: assembly {\n        /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":25:136  contract Strings {... */\n      mstore(0x40, 0x80)\n      callvalue\n        /* \"--CODEGEN--\":8:17   */\n      dup1\n        /* \"--CODEGEN--\":5:7   */\n      iszero\n      tag_1\n      jumpi\n        /* \"--CODEGEN--\":30:31   */\n      0x00\n        /* \"--CODEGEN--\":27:28   */\n      dup1\n        /* \"--CODEGEN--\":20:32   */\n      revert\n        /* \"--CODEGEN--\":5:7   */\n    tag_1:\n        /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":25:136  contract Strings {... */\n      pop\n      jumpi(tag_2, lt(calldatasize, 0x04))\n      shr(0xe0, calldataload(0x00))\n      dup1\n      0x6d4ce63c\n      eq\n      tag_3\n      jumpi\n    tag_2:\n      0x00\n      dup1\n      revert\n        /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":48:134  function get() public view returns (string memory res) {... */\n    tag_3:\n      tag_4\n      tag_5\n      jump\t// in\n    tag_4:\n      mload(0x40)\n      dup1\n      dup1\n      0x20\n      add\n      dup3\n      dup2\n      sub\n      dup3\n      mstore\n      dup4\n      dup2\n      dup2\n      mload\n      dup2\n      mstore\n      0x20\n      add\n      swap2\n      pop\n      dup1\n      mload\n      swap1\n      0x20\n      add\n      swap1\n      dup1\n      dup4\n      dup4\n        /* \"--CODEGEN--\":23:24   */\n      0x00\n        /* \"--CODEGEN--\":8:108   */\n    tag_6:\n        /* \"--CODEGEN--\":33:36   */\n      dup4\n        /* \"--CODEGEN--\":30:31   */\n      dup2\n        /* \"--CODEGEN--\":27:37   */\n      lt\n        /* \"--CODEGEN--\":8:108   */\n      iszero\n      tag_8\n      jumpi\n        /* \"--CODEGEN--\":99:100   */\n      dup1\n        /* \"--CODEGEN--\":94:97   */\n      dup3\n        /* \"--CODEGEN--\":90:101   */\n      add\n        /* \"--CODEGEN--\":84:102   */\n      mload\n        /* \"--CODEGEN--\":80:81   */\n      dup2\n        /* \"--CODEGEN--\":75:78   */\n      dup5\n        /* \"--CODEGEN--\":71:82   */\n      add\n        /* \"--CODEGEN--\":64:103   */\n      mstore\n        /* \"--CODEGEN--\":52:54   */\n      0x20\n        /* \"--CODEGEN--\":49:50   */\n      dup2\n        /* \"--CODEGEN--\":45:55   */\n      add\n        /* \"--CODEGEN--\":40:55   */\n      swap1\n      pop\n        /* \"--CODEGEN--\":8:108   */\n      jump(tag_6)\n    tag_8:\n        /* \"--CODEGEN--\":12:26   */\n      pop\n        /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":48:134  function get() public view returns (string memory res) {... */\n      pop\n      pop\n      pop\n      swap1\n      pop\n      swap1\n      dup2\n      add\n      swap1\n      0x1f\n      and\n      dup1\n      iszero\n      tag_9\n      jumpi\n      dup1\n      dup3\n      sub\n      dup1\n      mload\n      0x01\n      dup4\n      0x20\n      sub\n      0x0100\n      exp\n      sub\n      not\n      and\n      dup2\n      mstore\n      0x20\n      add\n      swap2\n      pop\n    tag_9:\n      pop\n      swap3\n      pop\n      pop\n      pop\n      mload(0x40)\n      dup1\n      swap2\n      sub\n      swap1\n      return\n    tag_5:\n        /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":84:101  string memory res */\n      0x60\n        /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":113:127  return \"Hello\" */\n      mload(0x40)\n      dup1\n      0x40\n      add\n      0x40\n      mstore\n      dup1\n      0x05\n      dup2\n      mstore\n      0x20\n      add\n      0x48656c6c6f000000000000000000000000000000000000000000000000000000\n      dup2\n      mstore\n      pop\n      swap1\n      pop\n        /* \"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":48:134  function get() public view returns (string memory res) {... */\n      swap1\n      jump\t// out\n\n    auxdata: 0xa165627a7a723058203deec5fc3a51dd1823d00a86a0f0ec59a48a8c4a780718c1a6114c501953106d0029\n}\n",
          "bytecode": {
            "linkReferences": {

            },
            "object": "608060405234801561001057600080fd5b50610114806100206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80636d4ce63c14602d575b600080fd5b603360ab565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101560715780820151818401526020810190506058565b50505050905090810190601f168015609d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b60606040518060400160405280600581526020017f48656c6c6f00000000000000000000000000000000000000000000000000000081525090509056fea165627a7a723058203deec5fc3a51dd1823d00a86a0f0ec59a48a8c4a780718c1a6114c501953106d0029",
            "opcodes": "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x114 DUP1 PUSH2 0x20 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN INVALID PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH1 0xF JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x4 CALLDATASIZE LT PUSH1 0x28 JUMPI PUSH1 0x0 CALLDATALOAD PUSH1 0xE0 SHR DUP1 PUSH4 0x6D4CE63C EQ PUSH1 0x2D JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH1 0x33 PUSH1 0xAB JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH1 0x71 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH1 0x58 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH1 0x9D JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x60 PUSH1 0x40 MLOAD DUP1 PUSH1 0x40 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x5 DUP2 MSTORE PUSH1 0x20 ADD PUSH32 0x48656C6C6F000000000000000000000000000000000000000000000000000000 DUP2 MSTORE POP SWAP1 POP SWAP1 JUMP INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 RETURNDATASIZE 0xee 0xc5 0xfc GASPRICE MLOAD 0xdd XOR 0x23 0xd0 EXP DUP7 LOG0 CREATE 0xec MSIZE LOG4 DUP11 DUP13 0x4a PUSH25 0x718C1A6114C501953106D0029000000000000000000000000 ",
            "sourceMap": "25:111:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;25:111:0;;;;;;;"
          },
          "deployedBytecode": {
            "linkReferences": {

            },
            "object": "6080604052348015600f57600080fd5b506004361060285760003560e01c80636d4ce63c14602d575b600080fd5b603360ab565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101560715780820151818401526020810190506058565b50505050905090810190601f168015609d5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b60606040518060400160405280600581526020017f48656c6c6f00000000000000000000000000000000000000000000000000000081525090509056fea165627a7a723058203deec5fc3a51dd1823d00a86a0f0ec59a48a8c4a780718c1a6114c501953106d0029",
            "opcodes": "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH1 0xF JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x4 CALLDATASIZE LT PUSH1 0x28 JUMPI PUSH1 0x0 CALLDATALOAD PUSH1 0xE0 SHR DUP1 PUSH4 0x6D4CE63C EQ PUSH1 0x2D JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST PUSH1 0x33 PUSH1 0xAB JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH1 0x71 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH1 0x58 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH1 0x9D JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x60 PUSH1 0x40 MLOAD DUP1 PUSH1 0x40 ADD PUSH1 0x40 MSTORE DUP1 PUSH1 0x5 DUP2 MSTORE PUSH1 0x20 ADD PUSH32 0x48656C6C6F000000000000000000000000000000000000000000000000000000 DUP2 MSTORE POP SWAP1 POP SWAP1 JUMP INVALID LOG1 PUSH6 0x627A7A723058 KECCAK256 RETURNDATASIZE 0xee 0xc5 0xfc GASPRICE MLOAD 0xdd XOR 0x23 0xd0 EXP DUP7 LOG0 CREATE 0xec MSIZE LOG4 DUP11 DUP13 0x4a PUSH25 0x718C1A6114C501953106D0029000000000000000000000000 ",
            "sourceMap": "25:111:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;25:111:0;;;;;;;;;;;;;;;;;;;48:86;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:10;8:100;;;99:1;94:3;90:11;84:18;80:1;75:3;71:11;64:39;52:2;49:1;45:10;40:15;;8:100;;;12:14;48:86:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;84:17;113:14;;;;;;;;;;;;;;;;;;;48:86;:::o"
          },
          "gasEstimates": {
            "creation": {
              "codeDepositCost": "55200",
              "executionCost": "105",
              "totalCost": "55305"
            },
            "external": {
              "get()": "infinite"
            }
          },
          "legacyAssembly": {
            ".code": [
              {
                "begin": 25,
                "end": 136,
                "name": "PUSH",
                "value": "80"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "PUSH",
                "value": "40"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "MSTORE"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "CALLVALUE"
              },
              {
                "begin": 8,
                "end": 17,
                "name": "DUP1"
              },
              {
                "begin": 5,
                "end": 7,
                "name": "ISZERO"
              },
              {
                "begin": 5,
                "end": 7,
                "name": "PUSH [tag]",
                "value": "1"
              },
              {
                "begin": 5,
                "end": 7,
                "name": "JUMPI"
              },
              {
                "begin": 30,
                "end": 31,
                "name": "PUSH",
                "value": "0"
              },
              {
                "begin": 27,
                "end": 28,
                "name": "DUP1"
              },
              {
                "begin": 20,
                "end": 32,
                "name": "REVERT"
              },
              {
                "begin": 5,
                "end": 7,
                "name": "tag",
                "value": "1"
              },
              {
                "begin": 5,
                "end": 7,
                "name": "JUMPDEST"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "POP"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "PUSH #[$]",
                "value": "0000000000000000000000000000000000000000000000000000000000000000"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "DUP1"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "PUSH [$]",
                "value": "0000000000000000000000000000000000000000000000000000000000000000"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "PUSH",
                "value": "0"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "CODECOPY"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "PUSH",
                "value": "0"
              },
              {
                "begin": 25,
                "end": 136,
                "name": "RETURN"
              }
            ],
            ".data": {
              "0": {
                ".auxdata": "a165627a7a723058203deec5fc3a51dd1823d00a86a0f0ec59a48a8c4a780718c1a6114c501953106d0029",
                ".code": [
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH",
                    "value": "80"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH",
                    "value": "40"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "MSTORE"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "CALLVALUE"
                  },
                  {
                    "begin": 8,
                    "end": 17,
                    "name": "DUP1"
                  },
                  {
                    "begin": 5,
                    "end": 7,
                    "name": "ISZERO"
                  },
                  {
                    "begin": 5,
                    "end": 7,
                    "name": "PUSH [tag]",
                    "value": "1"
                  },
                  {
                    "begin": 5,
                    "end": 7,
                    "name": "JUMPI"
                  },
                  {
                    "begin": 30,
                    "end": 31,
                    "name": "PUSH",
                    "value": "0"
                  },
                  {
                    "begin": 27,
                    "end": 28,
                    "name": "DUP1"
                  },
                  {
                    "begin": 20,
                    "end": 32,
                    "name": "REVERT"
                  },
                  {
                    "begin": 5,
                    "end": 7,
                    "name": "tag",
                    "value": "1"
                  },
                  {
                    "begin": 5,
                    "end": 7,
                    "name": "JUMPDEST"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "POP"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH",
                    "value": "4"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "CALLDATASIZE"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "LT"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH [tag]",
                    "value": "2"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "JUMPI"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH",
                    "value": "0"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "CALLDATALOAD"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH",
                    "value": "E0"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "SHR"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "DUP1"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH",
                    "value": "6D4CE63C"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "EQ"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH [tag]",
                    "value": "3"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "JUMPI"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "tag",
                    "value": "2"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "JUMPDEST"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "PUSH",
                    "value": "0"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "DUP1"
                  },
                  {
                    "begin": 25,
                    "end": 136,
                    "name": "REVERT"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "tag",
                    "value": "3"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "JUMPDEST"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH [tag]",
                    "value": "4"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH [tag]",
                    "value": "5"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "JUMP",
                    "value": "[in]"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "tag",
                    "value": "4"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "JUMPDEST"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "40"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "MLOAD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "20"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "ADD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP3"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SUB"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP3"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "MSTORE"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP4"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "MLOAD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "MSTORE"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "20"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "ADD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "MLOAD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "20"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "ADD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP4"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP4"
                  },
                  {
                    "begin": 23,
                    "end": 24,
                    "name": "PUSH",
                    "value": "0"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "tag",
                    "value": "6"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "JUMPDEST"
                  },
                  {
                    "begin": 33,
                    "end": 36,
                    "name": "DUP4"
                  },
                  {
                    "begin": 30,
                    "end": 31,
                    "name": "DUP2"
                  },
                  {
                    "begin": 27,
                    "end": 37,
                    "name": "LT"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "ISZERO"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "PUSH [tag]",
                    "value": "8"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "JUMPI"
                  },
                  {
                    "begin": 99,
                    "end": 100,
                    "name": "DUP1"
                  },
                  {
                    "begin": 94,
                    "end": 97,
                    "name": "DUP3"
                  },
                  {
                    "begin": 90,
                    "end": 101,
                    "name": "ADD"
                  },
                  {
                    "begin": 84,
                    "end": 102,
                    "name": "MLOAD"
                  },
                  {
                    "begin": 80,
                    "end": 81,
                    "name": "DUP2"
                  },
                  {
                    "begin": 75,
                    "end": 78,
                    "name": "DUP5"
                  },
                  {
                    "begin": 71,
                    "end": 82,
                    "name": "ADD"
                  },
                  {
                    "begin": 64,
                    "end": 103,
                    "name": "MSTORE"
                  },
                  {
                    "begin": 52,
                    "end": 54,
                    "name": "PUSH",
                    "value": "20"
                  },
                  {
                    "begin": 49,
                    "end": 50,
                    "name": "DUP2"
                  },
                  {
                    "begin": 45,
                    "end": 55,
                    "name": "ADD"
                  },
                  {
                    "begin": 40,
                    "end": 55,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 40,
                    "end": 55,
                    "name": "POP"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "PUSH [tag]",
                    "value": "6"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "JUMP"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "tag",
                    "value": "8"
                  },
                  {
                    "begin": 8,
                    "end": 108,
                    "name": "JUMPDEST"
                  },
                  {
                    "begin": 12,
                    "end": 26,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "ADD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "1F"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "AND"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "ISZERO"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH [tag]",
                    "value": "9"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "JUMPI"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP3"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SUB"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "MLOAD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP4"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "20"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SUB"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "100"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "EXP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SUB"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "NOT"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "AND"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "MSTORE"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "20"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "ADD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "tag",
                    "value": "9"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "JUMPDEST"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP3"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "PUSH",
                    "value": "40"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "MLOAD"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "DUP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP2"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SUB"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "RETURN"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "tag",
                    "value": "5"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "JUMPDEST"
                  },
                  {
                    "begin": 84,
                    "end": 101,
                    "name": "PUSH",
                    "value": "60"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "PUSH",
                    "value": "40"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "MLOAD"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "DUP1"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "PUSH",
                    "value": "40"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "ADD"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "PUSH",
                    "value": "40"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "MSTORE"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "DUP1"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "PUSH",
                    "value": "5"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "DUP2"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "MSTORE"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "PUSH",
                    "value": "20"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "ADD"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "PUSH",
                    "value": "48656C6C6F000000000000000000000000000000000000000000000000000000"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "DUP2"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "MSTORE"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "POP"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 113,
                    "end": 127,
                    "name": "POP"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "SWAP1"
                  },
                  {
                    "begin": 48,
                    "end": 134,
                    "name": "JUMP",
                    "value": "[out]"
                  }
                ]
              }
            }
          },
          "methodIdentifiers": {
            "get()": "6d4ce63c"
          }
        },
        "metadata": "{\"compiler\":{\"version\":\"0.5.7+commit.6da8b019\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"constant\":true,\"inputs\":[],\"name\":\"get\",\"outputs\":[{\"name\":\"res\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}],\"devdoc\":{\"methods\":{}},\"userdoc\":{\"methods\":{}}},\"settings\":{\"compilationTarget\":{\"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":\"Strings\"},\"evmVersion\":\"petersburg\",\"libraries\":{},\"optimizer\":{\"enabled\":false,\"runs\":200},\"remappings\":[]},\"sources\":{\"/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol\":{\"keccak256\":\"0x12a060e87d1ee2b5ffe9604f2c6c8ec1f4a574d0acdb58ac2cf03b7fd7e2c036\",\"urls\":[\"bzzr://a371849c0ba383f32c1fb027153f00868a0ddcf9a61e8659472578b07784f6f7\"]}},\"version\":1}",
        "userdoc": {
          "methods": {

          }
        }
      }
    }
  },
  "errors": [
    {
      "component": "general",
      "formattedMessage": "/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol:4:5: Warning: Function state mutability can be restricted to pure\n    function get() public view returns (string memory res) {\n    ^ (Relevant source part starts here and spans across multiple lines).\n",
      "message": "Function state mutability can be restricted to pure",
      "severity": "warning",
      "sourceLocation": {
        "end": 134,
        "file": "/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol",
        "start": 48
      },
      "type": "Warning"
    }
  ],
  "sources": {
    "/home/diptajit/code/solidity-examples/UnitTesting/string/string.sol": {
      "id": 0
    }
  }
}

const fileName = Object.keys(compiled.sources)[0]
const contractName = Object.keys(compiled.contracts[fileName]).map((contractName) => contractName)
const bytecode = compiled.contracts[fileName][contractName].evm.bytecode.object
const abi = compiled.contracts[fileName][contractName].abi

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <ContractDeploy
          contractName={contractName}
          abi={JSON.stringify(abi)}
          bytecode={JSON.stringify(bytecode)}
          gasEstimate={'126817'} />
      </Provider>
      )
    .toJSON();
  expect(tree).toMatchSnapshot();
});