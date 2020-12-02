import React, { MutableRefObject, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, ButtonType } from 'components/common/ui';
import { ABIDescription, ConstructorInput, IAccount } from 'types';

interface IProps {
  abi: Array<ABIDescription>;
  gasEstimate: number;
  pvtKey: string;
  unsignedTx: string;
  constructorInputRef: MutableRefObject<ConstructorInput | ConstructorInput[] | null>;
  handleDeploy: () => void;
  handleBuildTxn: () => void;
}

interface IPropsTextArea {
  value: ConstructorInput | ConstructorInput[];
  onChange: (value: ConstructorInput[]) => void;
  constructorInputRef: MutableRefObject<ConstructorInput | ConstructorInput[] | null>;
}

type TDeployForm = {
  gasSupply: number;
  constructorInput: ConstructorInput | ConstructorInput[];
};

const ParseTextarea: React.FC<IPropsTextArea> = ({ value, onChange, constructorInputRef }: IPropsTextArea) => {
  const [text, setText] = React.useState<string>('{}');
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

  return <textarea className="json_input custom_input_css" onChange={handleChange} value={text} />;
};

const DeployForm: React.FC<IProps> = (props: IProps) => {
  const [gasEstimateToggle, setGasEstimateToggle] = useState(false);
  const [buildTxToggle, setBuildTxToggle] = useState(true);
  const { control, register, handleSubmit, getValues, setValue } = useForm<TDeployForm>();
  useEffect(() => {
    const { abi } = props;
    // setValue('constructorInput', constructorInput);

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

  const { pvtKey, unsignedTx, handleDeploy, gasEstimate, handleBuildTxn } = props;
  return (
    <form onSubmit={handleSubmit(handleDeploy)}>
      <div className="form-container">
        <div className="json_input_container" style={{ marginLeft: '-10px' }}>
          <Controller
            name="constructorInput"
            render={() => (
              <ParseTextarea
                value={getValues('constructorInput')}
                constructorInputRef={props.constructorInputRef}
                onChange={(input: ConstructorInput[]) => {
                  setValue('constructorInput', input);
                  // props.onChange(input);
                }}
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
      {/* Build unsigned transaction */}
      <div className="input-container">
        {gasEstimate > 0 ? (
          <Button buttonType={ButtonType.Button} disabled={buildTxToggle} onClick={handleBuildTxn}>
            Build transaction
          </Button>
        ) : (
          <Button buttonType={ButtonType.Button} disabled onClick={handleBuildTxn}>
            Build transaction
          </Button>
        )}
      </div>
      <div className="account_row">
        <div className="tag">
          <Button buttonType={ButtonType.Input} disabled={!!(pvtKey && unsignedTx)}>
            Sign & Deploy
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DeployForm;
