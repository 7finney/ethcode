// @ts-ignore
import React from "react";

interface IProps {
  contractName: string;
  abi: any;
  onSubmit: () => void;
}
const InputsForm = (props: IProps) => {
  const { contractName, abi } = props;

  const { register, handleSubmit } = useForm();

  const handleChange = (input: any, event: any) => {
    // eslint-disable-next-line no-param-reassign
    input.value = event.target.value;
  };

  return (
    <div id={`${contractName}_inputs`}>
      {abi.type === "constructor" &&
        abi.inputs.map((input: any, i: string) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <form key={i} onSubmit={props.onSubmit}>
              <button className="input text-subtle">{input.name}</button>
              <input
                id={i}
                type="text"
                className="inputs"
                placeholder={input.type}
                value={input.value}
                onChange={(e) => handleChange(input, e)}
              />
            </form>
          );
        })}
    </div>
  );
};

export default InputsForm;
