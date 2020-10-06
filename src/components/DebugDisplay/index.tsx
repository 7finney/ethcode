import React, { useEffect, useState } from "react";
import ReactDiffViewer from "react-diff-viewer";
import "./DebugDisplay.css";
import { Button } from "../common/ui";
import { useForm } from "react-hook-form";

interface IProps {
  vscode: any;
  txTrace: any;
  testNetId: string;
  traceError: string;
}

type FormInputs = {
  txHash: string;
};

const DebugDisplay = (props: IProps) => {
  // const [txHash, setTxHash] = useState("");
  const [oldDebugObj, setOldDebugObj] = useState({});
  const [newDebugObj, setNewDebugObj] = useState({});
  const [indx, setIndx] = useState(-1);
  const [testNetId, setTestNetId] = useState("");
  const [disable, setDisable] = useState(false);
  const [traceError, setTraceError] = useState("");

  const { register, handleSubmit } = useForm<FormInputs>();

  const onSubmit = ({ txHash }: FormInputs) => {
    setIndx(-1);
    setDisable(true);
    setNewDebugObj({});
    setOldDebugObj({});
    setTraceError("");
    props.vscode.postMessage({
      command: "debugTransaction",
      txHash,
      testNetId,
    });
  };

  useEffect(() => {
    setDisable(false);
    setTraceError(props.traceError);
  }, [props.traceError]);

  useEffect(() => {
    setIndx(0);
    setOldDebugObj(newDebugObj);
    setNewDebugObj(props.txTrace[0]);
    setDisable(false);
    setTraceError("");
  }, [newDebugObj, props.txTrace]);

  useEffect(() => {
    setTestNetId(props.testNetId);
  }, [props.testNetId]);

  // const handleChange = (event: any) => {
  //   setTxHash(event.target.value);
  // };

  const stopDebug = () => {
    setDisable(false);
    setIndx(-1);
    setTraceError("");
  };

  const debugInto = () => {
    const { txTrace } = props;
    const index = indx < txTrace.length - 1 ? indx + 1 : txTrace.length - 1;
    if (txTrace.length > 0) {
      setIndx(index);
      setNewDebugObj(txTrace[index]);
      setOldDebugObj(newDebugObj);
    }
  };

  const debugBack = () => {
    const { txTrace } = props;
    const index = indx > 0 ? indx - 1 : 0;
    if (txTrace.length > 0) {
      setIndx(index);
      setNewDebugObj(txTrace[index]);
      setOldDebugObj(txTrace[index - 1]);
    }
  };

  const { txTrace } = props;

  return (
    <div className="container">
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>
            <span style={{ marginRight: "5px" }}>Transaction hash:</span>
            <input name="txHash" type="text" className="custom_input_css" ref={register} />
          </label>
          <Button ButtonType="input" disabled={disable} style={{ marginLeft: "10px" }} value="Debug" />
        </form>
        <p>
          <button className="text-subtle custom_button_css" onClick={stopDebug}>
            Stop
          </button>
        </p>
      </div>
      {indx >= 0 && (
        <div>
          <div>
            <p>OPCodes:</p>
            <div>
              <ul className="opDiv" style={{ paddingLeft: 0 }}>
                {txTrace.map((obj: any, index: any) => {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <li className={index === indx ? "selected" : ""} key={index} id={index}>
                      {obj.op}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p>
                <button className="custom_button_css" style={{ marginRight: "20px" }} onClick={debugBack}>
                  Step Back
                </button>
                <button className="custom_button_css" onClick={debugInto}>
                  Step Into
                </button>
              </p>
            </div>
          </div>
          {/* TODO */}
          <div
            style={{
              width: "100%",
              overflowX: "scroll",
              overflowY: "hidden",
            }}
          >
            <ReactDiffViewer
              oldValue={JSON.stringify(oldDebugObj, null, "\t")}
              newValue={JSON.stringify(newDebugObj, null, "\t")}
              disableWordDiff
              hideLineNumbers
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
