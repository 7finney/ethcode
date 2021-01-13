import React, { MutableRefObject, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, ButtonType, TextArea } from 'components/common/ui';
import { ABIDescription, ConstructorInput, IAccount, ABIParameter } from 'types';
import { abiHelpers } from '../common/lib';

interface IProps {
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  currAccount: IAccount;
  testNetId: string;
  gasEstimate: number;
  constructorInputRef: MutableRefObject<ConstructorInput[] | null>;
  openAdvanceDeploy: () => void;
}

interface TDeployForm {
  gasSupply: number;
  constructorInput: Array<ABIParameter>;
}

const DeployForm: React.FC<IProps> = (props: IProps) => {
  const [testNetId, setTestNetId] = useState('');

  const { control, register, handleSubmit, getValues, setValue } = useForm<TDeployForm>();
  useEffect(() => {
    setTestNetId(props.testNetId);
    const { abi } = props;
    const constructorABI: ABIDescription = abiHelpers.getConstructorABI(abi);
    if (constructorABI) {
      const inputs = constructorABI.inputs?.map((input) => {
        return { ...input, value: '' };
      });
      if (inputs) setValue('constructorInput', inputs);
    }
  }, [props.abi]);

  // set gas estimate
  useEffect(() => {
    setValue('gasSupply', props.gasEstimate);
  }, [props.gasEstimate]);

  const handleDeploy = () => {
    const { vscode, bytecode, abi, currAccount } = props;
    vscode.postMessage({
      command: 'run-deploy',
      payload: {
        abi,
        bytecode,
        params: getValues('constructorInput') || [],
        gasSupply: getValues('gasSupply'),
        from: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
      },
      testNetId,
    });
  };
  return (
    <form onSubmit={handleSubmit(handleDeploy)}>
      <div className="form-container">
        <div className="json_input_container">
          <Controller
            name="constructorInput"
            render={() => (
              <TextArea
                value={getValues('constructorInput')}
                inputRef={props.constructorInputRef}
                onChange={(input: Array<ConstructorInput>) => setValue('constructorInput', input)}
              />
            )}
            control={control}
          />
        </div>
      </div>
      <div className="gas_supply">
        <label className="label_name" style={{ marginRight: '10px' }}>
          Gas Supply:
        </label>
        <input
          type="number"
          placeholder='click on "get gas estimate" '
          className="input custom_input_css"
          id="deployGas"
          ref={register}
          name="gasSupply"
        />
      </div>
      <div style={{ marginBottom: '5px' }}>
        {testNetId !== 'ganache' ? (
          <Button buttonType={ButtonType.Input} onClick={props.openAdvanceDeploy}>
            Advance Deploy
          </Button>
        ) : (
          <Button buttonType={ButtonType.Input} disabled={!(getValues('gasSupply') > 0)}>
            Deploy
          </Button>
        )}
      </div>
    </form>
  );
};

export default DeployForm;
