import { createContext } from 'react';
import { CompilationResult } from './types';

interface ContextInterface {
  compiledJSON: CompilationResult | undefined;
  setCompiledJSON: (_value: CompilationResult | undefined) => void;
  activeFileName: string;
  setActiveFileName: (_value: string) => void;
  testNetID: string;
  setTestNetID: (_value: string) => void;
}
export const AppContext = createContext<ContextInterface>({
  compiledJSON: undefined,
  setCompiledJSON: (_value: CompilationResult | undefined) => {},
  activeFileName: '',
  setActiveFileName: (_value: string) => {},
  testNetID: 'ganache',
  setTestNetID: (_value: string) => {},
});
