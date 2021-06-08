import React from 'react';

interface IProps {
  type: string;
}

const Input: React.FC<IProps> = ({ ...props }) => {
  return <input className={props.type === 'submit' ? 'custom_button_css' : 'custom_input_css'} {...props} />;
};

export default Input;
