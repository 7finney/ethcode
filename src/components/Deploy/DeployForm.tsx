import React, { MutableRefObject, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonType, TextArea } from 'components/common/ui';
import { ABIDescription, ConstructorInput, GlobalStore, ABIParameter } from 'types';
import { setErrMsg } from 'actions';
import { abiHelpers } from '../common/lib';

interface IProps {
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  gasEstimate: number;
  constructorInputRef: MutableRefObject<Array<ConstructorInput> | null>;
}

type TDeployForm = {
  gasSupply: number;
  constructorInput: Array<ABIParameter>;
};

const DeployForm: React.FC<IProps> = (props: IProps) => {
  const [buildTxToggle, setBuildTxToggle] = useState(true);
  const { control, register, getValues, setValue } = useForm<TDeployForm>();
  // redux
  // UseSelector to extract state elements.
  const { testNetId, currAccount, unsignedTx, pvtKey } = useSelector((state: GlobalStore) => ({
    testNetId: state.debugStore.testNetId,
    currAccount: state.accountStore.currAccount,
    unsignedTx: state.txStore.unsignedTx,
    pvtKey: state.accountStore.privateKey,
  }));
  const dispatch = useDispatch();
  useEffect(() => {
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
          params: getValues('constructorInput') || [],
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
              <TextArea
                value={getValues('constructorInput')}
                inputRef={props.constructorInputRef}
                onChange={(input: Array<ConstructorInput>) => {
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
