import { ABIDescription, FunctionDescription } from 'types';

export function getMethodABI(abi: Array<ABIDescription>, methodName: string): FunctionDescription {
  const index = abi.findIndex((item) => {
    return item.type !== 'constructor' && item.type !== 'event' && item.name === methodName;
  });
  return <FunctionDescription>abi[index];
}
export function getConstructorABI(abi: Array<ABIDescription>): FunctionDescription {
  const index = abi.findIndex((item) => {
    return item.type === 'constructor';
  });
  return <FunctionDescription>abi[index];
}
