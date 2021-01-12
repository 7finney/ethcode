import { ABIDescription, FunctionDescription } from 'types';

export function getMethodABI(abi: Array<ABIDescription>, methodName: string): FunctionDescription {
  // lets get rid of constructor
  const index = abi.findIndex((item) => {
    return item.type !== 'constructor' && item.type !== 'event' && item.name === methodName;
  });
  return <FunctionDescription>abi[index];
}
export function getConstructorInputs(abi: Array<ABIDescription>) {
  const index = abi.findIndex((item) => {
    return item.type === 'constructor';
  });
  return abi[index];
}
