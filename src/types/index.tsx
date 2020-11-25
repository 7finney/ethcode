export type IAccount = {
  label: string;
  value: any[];
  type?: string;
  pubAddr?: string;
  checksumAddr?: string;
};

export type SolcVersionType = {
  value: string;
  label: string;
};

export interface GroupedSelectorAccounts {
  label: string;
  options: IAccount[];
}

export type ABIDescription = FunctionDescription | EventDescription;

export type FunctionDescription = {
  /** Type of the method. default is 'function' */
  type?: "function" | "constructor" | "fallback";
  /** The name of the function. Constructor and fallback function never have name */
  name?: string;
  /** List of parameters of the method. Fallback function doesn’t have inputs. */
  inputs?: Array<ABIParameter>;
  /** List of the outputs parameters for the method, if any */
  outputs?: Array<ABIParameter>;
  /** State mutability of the method */
  stateMutability: "pure" | "view" | "nonpayable" | "payable";
  /** true if function accepts Ether, false otherwise. Default is false */
  payable?: boolean;
  /** true if function is either pure or view, false otherwise. Default is false  */
  constant?: boolean;
};

export type EventDescription = {
  type: "event";
  name: string;
  inputs: ABIParameter &
    {
      /** true if the field is part of the log’s topics, false if it one of the log’s data segment. */
      indexed: boolean;
    }[];
  /** true if the event was declared as anonymous. */
  anonymous: boolean;
};

export type ABIParameter = {
  /** The name of the parameter */
  name: string;
  /** The canonical type of the parameter */
  type: ABITypeParameter;
  /** Used for tuple types */
  components?: ABIParameter[];
};

export type ABITypeParameter =
  | "uint"
  | "uint[]" // TODO : add <M>
  | "int"
  | "int[]" // TODO : add <M>
  | "address"
  | "address[]"
  | "bool"
  | "bool[]"
  | "fixed"
  | "fixed[]" // TODO : add <M>
  | "ufixed"
  | "ufixed[]" // TODO : add <M>
  | "bytes"
  | "bytes[]" // TODO : add <M>
  | "function"
  | "function[]"
  | "tuple"
  | "tuple[]"
  | string; // Fallback

// COMPILATION RESULT

export type CompilationResult = {
  /** not present if no errors/warnings were encountered */
  errors?: CompilationError[];
  /** This contains the file-level outputs. In can be limited/filtered by the outputSelection settings */
  sources: {
    [fileName: string]: CompilationSource;
  };
  /** This contains the contract-level outputs. It can be limited/filtered by the outputSelection settings */
  contracts: {
    /** If the language used has no contract names, this field should equal to an empty string. */
    [fileName: string]: {
      [contract: string]: CompiledContract;
    };
  };
};

export type CompilationFileSources = {
  [fileName: string]: string;
};

export type CompilationError = {
  /** Location within the source file */
  sourceLocation?: {
    file: string;
    start: number;
    end: number;
  };
  /** Error type */
  type: CompilationErrorType;
  /** Component where the error originated, such as "general", "ewasm", etc. */
  component: "general" | "ewasm" | string;
  severity: "error" | "warning";
  message: string;
  /** the message formatted with source location */
  formattedMessage?: string;
};

type CompilationErrorType =
  | "JSONError"
  | "IOError"
  | "ParserError"
  | "DocstringParsingError"
  | "SyntaxError"
  | "DeclarationError"
  | "TypeError"
  | "UnimplementedFeatureError"
  | "InternalCompilerError"
  | "Exception"
  | "CompilerError"
  | "FatalError"
  | "Warning";

export type CompilationSource = {
  /** Identifier of the source (used in source maps) */
  id: number;
  /** The AST object */
  ast: AstNode;
  /** The legacy AST object */
  legacyAST: AstNodeLegacy;
};

export type AstNode = {
  absolutePath?: string;
  exportedSymbols?: Record<string, unknown>;
  id: number;
  nodeType: string;
  nodes?: Array<AstNode>;
  src: string;
  literals?: Array<string>;
  file?: string;
  scope?: number;
  sourceUnit?: number;
  symbolAliases?: Array<string>;
  [x: string]: any;
};

export type AstNodeLegacy = {
  id: number;
  name: string;
  src: string;
  children?: Array<AstNodeLegacy>;
  attributes?: AstNodeAtt;
};

export type AstNodeAtt = {
  operator?: string;
  string?: null;
  type?: string;
  value?: string;
  constant?: boolean;
  name?: string;
  public?: boolean;
  exportedSymbols?: Record<string, unknown>;
  argumentTypes?: null;
  absolutePath?: string;
  [x: string]: any;
};

// Compiled contract output type
export type CompiledContract = {
  /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
  abi: ABIDescription[];
  // See the Metadata Output documentation (serialised JSON string)
  metadata: string;
  /** User documentation (natural specification) */
  userdoc: UserDocumentation;
  /** Developer documentation (natural specification) */
  devdoc: DeveloperDocumentation;
  /** Intermediate representation (string) */
  ir: string;
  /** EVM-related outputs */
  evm: {
    assembly: string;
    legacyAssembly: Record<string, unknown>;
    /** Bytecode and related details. */
    bytecode: BytecodeObject;
    deployedBytecode: BytecodeObject;
    /** The list of function hashes */
    methodIdentifiers: {
      [functionIdentifier: string]: string;
    };
    // Function gas estimates
    gasEstimates: {
      creation: {
        codeDepositCost: string;
        executionCost: "infinite" | string;
        totalCost: "infinite" | string;
      };
      external: {
        [functionIdentifier: string]: string;
      };
      internal: {
        [functionIdentifier: string]: "infinite" | string;
      };
    };
  };
  /** eWASM related outputs */
  ewasm: {
    /** S-expressions format */
    wast: string;
    /** Binary format (hex string) */
    wasm: string;
  };
};

export type BytecodeObject = {
  /** The bytecode as a hex string. */
  object: string;
  /** Opcodes list */
  opcodes: string;
  /** The source mapping as a string. See the source mapping definition. */
  sourceMap: string;
  /** If given, this is an unlinked object. */
  linkReferences?: {
    [contractName: string]: {
      /** Byte offsets into the bytecode. */
      [library: string]: { start: number; length: number }[];
    };
  };
};

export type DeveloperDocumentation = {
  author: string;
  title: string;
  details: string;
  methods: DevMethodList;
};

export type DevMethodList = {
  [functionIdentifier: string]: DevMethodDoc;
};

export type DevMethodDoc = {
  author: string;
  details: string;
  return: string;
  params: {
    [param: string]: string;
  };
};

// Userdoc
export type UserDocumentation = {
  methods: UserMethodList;
  notice: string;
};

export type UserMethodList = {
  [functionIdentifier: string]: UserMethodDoc;
} & {
  constructor?: string;
};
export type UserMethodDoc = {
  notice: string;
};

export type ConstructorInputs = {
  internalType: string;
  name: string;
  type: string;
  value?: string;
};
