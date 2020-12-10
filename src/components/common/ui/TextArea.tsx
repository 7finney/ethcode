import React, { useEffect } from 'react';
import { ABIParameter } from 'types';

interface ITextArea {
  value: Array<ABIParameter>;
  onChange: (value: Array<ABIParameter>) => void;
}

const TextArea: React.FC<ITextArea> = ({ value, onChange }: ITextArea) => {
  const [text, setText] = React.useState<string>('[]');
  useEffect(() => {
    setText(JSON.stringify(value, null, '\t'));
  }, [value]);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setText(JSON.stringify(JSON.parse(value), null, '\t'));
    onChange(JSON.parse(value));
  };
  return <textarea wrap="off" className="custom_input_css json_input" onChange={handleChange} value={text} />;
};

export default TextArea;
