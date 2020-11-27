import React, { CSSProperties } from 'react';
import './button.css';

export enum ButtonType {
  Input = 'input',
  Button = 'button',
}

interface IProps {
  disabled?: boolean;
  buttonType: ButtonType;
  onClick?: () => void;
  style?: CSSProperties;
}

const Button: React.FC<IProps> = (props, { buttonType, disabled }) => {
  switch (buttonType) {
    case ButtonType.Input:
      return (
        <input
          type="submit"
          className={disabled ? 'custom_button_css button_disable' : 'custom_button_css'}
          {...props}
        />
      );
    case ButtonType.Button:
      return <button className={disabled ? 'custom_button_css button_disable' : 'custom_button_css'} {...props} />;
    default:
      return <button className={disabled ? 'custom_button_css button_disable' : 'custom_button_css'} {...props} />;
  }
};

export default Button;
