import React, { useContext, useEffect, useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import './DebugDisplay.css';
import { Button, ButtonType } from '..';
import { useForm } from 'react-hook-form';
import { AppContext } from '../../appContext';

interface IProps {
  vscode: any;
  txTrace: any;
  traceError: string;
}

type FormInputs = {
  txHash: string;
};

const DebugDisplay = (props: IProps) => {
  const [oldDebugObj, setOldDebugObj] = useState<string>();
  const [newDebugObj, setNewDebugObj] = useState<string>();
  const [opIndex, setOpIndex] = useState(-1);
  const [disable, setDisable] = useState(false);
  const [traceError, setTraceError] = useState('');
  // Context
  const { testNetID } = useContext(AppContext);

  const { register, handleSubmit } = useForm<FormInputs>();

  const onSubmit = ({ txHash }: FormInputs) => {
    setOpIndex(-1);
    setDisable(true);
    setNewDebugObj('');
    setOldDebugObj('');
    setTraceError('');
    props.vscode.postMessage({
      command: 'debugTransaction',
      txHash,
      testNetId: testNetID,
    });
  };

  useEffect(() => {
    setDisable(false);
    setTraceError(props.traceError);
  }, [props.traceError]);

  useEffect(() => {
    const { txTrace } = props;
    if (txTrace.length > 0) {
      const idx = 0;
      setOpIndex(idx);
      setDisable(false);
      setTraceError('');
    }
  }, [props.txTrace]);

  useEffect(() => {
    setOldDebugObj(JSON.stringify(props.txTrace[opIndex], null, '\t'));
    setNewDebugObj(JSON.stringify(props.txTrace[opIndex + 1], null, '\t'));
  }, [opIndex]);

  const stopDebug = () => {
    setDisable(false);
    setOpIndex(-1);
    setTraceError('');
  };

  const debugInto = () => {
    const { txTrace } = props;
    const idx = Math.min(opIndex + 1, txTrace.length - 1);
    if (txTrace.length > 0) {
      setOpIndex(idx);
    }
  };

  const debugBack = () => {
    const { txTrace } = props;
    const idx = Math.max(opIndex - 1, 0);
    if (txTrace.length > 0) {
      setOpIndex(idx);
    }
  };

  const { txTrace } = props;

  return (
    <div className="container">
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            <span style={{ marginRight: '5px' }}>Transaction hash:</span>
            <input name="txHash" type="text" className="custom_input_css" ref={register} />
          </label>
          <Button buttonType={ButtonType.Input} disabled={disable} style={{ marginLeft: '10px' }}>
            Debug
          </Button>
        </form>
        <p>
          <Button buttonType={ButtonType.Input} onClick={stopDebug}>
            Stop
          </Button>
        </p>
      </div>
      {opIndex >= 0 && txTrace.length > 0 && (
        <div>
          <div>
            <p>OPCodes:</p>
            <div>
              <ul className="opDiv" style={{ paddingLeft: 0 }}>
                {txTrace &&
                  txTrace.length > 0 &&
                  txTrace.map((obj: any, index: any) => {
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <li className={index === opIndex ? 'selected' : ''} key={index} id={index}>
                        {obj.op}
                      </li>
                    );
                  })}
              </ul>
            </div>
            <div>
              <p>
                <Button buttonType={ButtonType.Button} style={{ marginRight: '20px' }} onClick={debugBack}>
                  Step Back
                </Button>
                <Button buttonType={ButtonType.Button} onClick={debugInto}>
                  Step Into
                </Button>
              </p>
            </div>
          </div>
          {/* TODO */}
          <div
            style={{
              width: '100%',
              overflowX: 'scroll',
              overflowY: 'hidden',
            }}
          >
            <ReactDiffViewer
              oldValue={oldDebugObj}
              newValue={newDebugObj}
              compareMethod={DiffMethod.WORDS}
              hideLineNumbers
              useDarkTheme
            />
          </div>
        </div>
      )}
      <div className="error_message">
        {traceError && (
          <div>
            <span className="contract-name inline-block highlight-success">Error Message:</span>
            <div>
              <pre className="large-code-error">{JSON.stringify(traceError)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugDisplay;
