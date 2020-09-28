import React from 'react'
import './index.css'
import Selector from './Selector';

export const Input = ({ ...props }) => {
  return (
    <input className={props.type === 'submit' ? 'custom_button_css' : 'custom_input_css'} {...props} />
  )
}

export const Button = (props: any) => {
  let Button = null;

  switch (props.ButtonType) {
    case 'input': 
      Button = <input type='submit' className={props.disabled ? 'custom_button_css button_disable': 'custom_button_css'} disabled={ props.disabled } {...props} />
      break;
    case 'button':
      Button = <button className={props.disabled ? 'custom_button_css button_disable': 'custom_button_css'}  disabled={ props.disabled } {...props} ></button>
      break;
    default:
      Button = <button className={props.disabled ? 'custom_button_css button_disable': 'custom_button_css'}  disabled={ props.disabled } {...props} ></button>
  }

  return (
    Button
  )
}

export { Selector };