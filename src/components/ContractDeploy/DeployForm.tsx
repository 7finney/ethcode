import React, { MutableRefObject, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, ButtonType } from 'components/common/ui';
import { ABIDescription, ConstructorInput, IAccount } from 'types';

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

interface IPropsTextArea {
  value: Array<ConstructorInput>;
  onChange: (value: Array<ConstructorInput>) => void;
  constructorInputRef: MutableRefObject<ConstructorInput[] | null>;
}

type TDeployForm = {
  gasSupply: number;
  constructorInput: Array<ConstructorInput>;
};

const ParseTextarea: React.FC<IPropsTextArea> = ({ value, onChange, constructorInputRef }: IPropsTextArea) => {
  const [text, setText] = React.useState<string>('[]');
  useEffect(() => {
    setText(JSON.stringify(value, null, '\t'));
  }, [value]);
  useEffect(() => {
    if (text) {
      /* eslint no-param-reassign: "warn" */
      constructorInputRef.current = JSON.parse(text);
    }
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setText(JSON.stringify(JSON.parse(value), null, '\t'));
    onChange(JSON.parse(value));
  };

  return <textarea wrap="off" className="custom_input_css json_input" onChange={handleChange} value={text} />;
};

const DeployForm: React.FC<IProps> = (props: IProps) => {
  const [testNetId, setTestNetId] = useState('');

  const { control, register, handleSubmit, getValues, setValue } = useForm<TDeployForm>();
  useEffect(() => {
    setTestNetId(props.testNetId);
    const { abi } = props;

    // eslint-disable-next-line no-restricted-syntax
    for (const i in abi) {
      if (abi[i].type === 'constructor' && abi[i].inputs!.length > 0) {
        try {
          const constructorInput: ConstructorInput[] = JSON.parse(JSON.stringify(abi[i].inputs));
          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const j in constructorInput) {
            constructorInput[j].value = '';
          }
          setValue('constructorInput', constructorInput);
        } catch (error) {
          console.error('Error In abi constructor parsing: ', error);
        }
      }
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
              <ParseTextarea
                value={getValues('constructorInput')}
                constructorInputRef={props.constructorInputRef}
                onChange={(input: ConstructorInput[]) => setValue('constructorInput', input)}
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
