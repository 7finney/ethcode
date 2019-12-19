import React from 'react'
import './index.css'

export const Input = ({ ...props }) => {
  return (
    <input className={props.type === 'submit' ? 'custom_button_css' : 'custom_input_css'} {...props} />
  )
}

export const Button = ({ ...props }) => {
  return (
    <button className={'custom_button_css'} {...props} ></button>
  )
}
