import React, { MutableRefObject, useEffect } from 'react';
import { ABIParameter, ConstructorInput } from 'types';

interface TextAreaInput extends ABIParameter, ConstructorInput {}

interface ITextAreaProps<T> {
  value: Array<T>;
  inputRef?: MutableRefObject<Array<T> | null>;
  onChange: (value: Array<T>) => void;
}
const TextArea: React.FC<ITextAreaProps<TextAreaInput>> = ({
  value,
  inputRef,
  onChange,
}: ITextAreaProps<TextAreaInput>) => {
  const [text, setText] = React.useState<string>('[]');
  useEffect(() => {
    setText(JSON.stringify(value, null, '\t'));
  }, [value]);
  useEffect(() => {
    if (text && inputRef) {
      /* eslint no-param-reassign: "warn" */
      inputRef.current = JSON.parse(text);
    }
  }, [text]);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setText(JSON.stringify(JSON.parse(value), null, '\t'));
    onChange(JSON.parse(value));
  };
  return <textarea wrap="off" className="custom_input_css json_input" onChange={handleChange} value={text} />;
};

export default TextArea;
