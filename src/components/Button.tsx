import React, { CSSProperties, FormEvent, MouseEvent } from 'react';
import './style.css';

export enum ButtonType {
  Input = 'input',
  Button = 'button',
}

interface IProps {
  buttonType: ButtonType;
  disabled?: boolean;
  onClick?: (_e: FormEvent<HTMLInputElement> | MouseEvent<HTMLElement>) => void;
  style?: CSSProperties;
  children?: any;
}

const Button: React.FC<IProps> = (props, { buttonType }: IProps) => {
  switch (buttonType) {
    case ButtonType.Input:
      return <input type="submit" className="custom_button_css" {...props} />;
    case ButtonType.Button:
      return <button className="custom_button_css" {...props} />;
    default:
      return <button className="custom_button_css" {...props} />;
  }
};

export default Button;
