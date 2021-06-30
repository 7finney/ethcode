import React, { useEffect, MutableRefObject } from 'react';
import { CompilationResult } from 'types';

interface TextAreaInput extends CompilationResult {}

interface ITextAreaProps<T> {
  value: T;
  inputRef?: MutableRefObject<T | null>;
  onChange: (value: T) => void;
}

const JSONInput: React.FC<ITextAreaProps<TextAreaInput>> = ({
  value,
  inputRef,
  onChange,
}: ITextAreaProps<TextAreaInput>) => {
  const [text, setText] = React.useState<string>('');
  useEffect(() => {
    setText(JSON.stringify(value, null, ' '));
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

export default JSONInput;
