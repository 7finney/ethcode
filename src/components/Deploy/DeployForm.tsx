import React, { MutableRefObject, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonType } from 'components/common/ui';
import { ABIDescription, ConstructorInput, GlobalStore } from 'types';
import { setErrMsg } from 'actions';

interface IProps {
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  gasEstimate: number;
  constructorInputRef: MutableRefObject<ConstructorInput | ConstructorInput[] | null>;
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

  return <textarea className="custom_input_css json_input" onChange={handleChange} value={text} />;
};

const DeployForm: React.FC<IProps> = (props: IProps) => {
  const [buildTxToggle, setBuildTxToggle] = useState(true);
  const { control, register, getValues, setValue } = useForm<TDeployForm>();
  // redux
  // UseSelector to extract state elements.
  const { testNetId, currAccount, unsignedTx, pvtKey } = useSelector((state: GlobalStore) => ({
    testNetId: state.debugStore.testNetId,
    currAccount: state.accountStore.currAccount,
    testNetCallResult: state.contractsStore.testNetCallResult,
    unsignedTx: state.txStore.unsignedTx,
    pvtKey: state.accountStore.privateKey,
  }));
  const dispatch = useDispatch();
  useEffect(() => {
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
    setBuildTxToggle(false);
  }, [props.gasEstimate]);

  const handleBuildTxn = () => {
    const { vscode, bytecode, abi } = props;
    const publicKey = currAccount ? (currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value) : '0x';
    // create unsigned transaction here
    try {
      vscode.postMessage({
        command: 'build-rawtx',
        payload: {
          from: publicKey,
          abi,
          bytecode,
          params: getValues('constructorInput'),
          gasSupply: getValues('gasSupply'),
        },
        testNetId,
      });
    } catch (error) {
      dispatch(setErrMsg(error));
    }
  };

  const signAndDeploy = () => {
    const { vscode } = props;
    try {
      vscode.postMessage({
        command: 'sign-deploy-tx',
        payload: {
          unsignedTx,
          pvtKey,
        },
        testNetId,
      });
    } catch (error) {
      dispatch(setErrMsg(error));
    }
  };

  const { gasEstimate } = props;
  return (
    <form>
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
        <Button
          buttonType={ButtonType.Button}
          disabled={gasEstimate > 0 ? buildTxToggle : true}
          onClick={handleBuildTxn}
        >
          Build transaction
        </Button>
        <Button buttonType={ButtonType.Input} onClick={signAndDeploy}>
          Sign & Deploy
        </Button>
      </div>
    </form>
  );
};

export default DeployForm;
