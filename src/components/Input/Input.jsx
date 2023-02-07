import React, { useState } from 'react';
import './Input.scss';

const Input = (props) => {

  let input;
  if (props.large){
    input = <textarea 
        name={props.name}
        value={props.value} 
        placeholder={props.placeholder}
        onChange={e => props.onChange(e)}
      />
  } else {
    input = <input
      name={props.name} 
      type="text"
      value={props.value} 
      placeholder={props.placeholder}
      onChange={e => props.onChange(e)}
    />
  }

  return (
    <div id='input'>
      <label>{props.label}</label>
      {input}
    </div>
  );
};

export default Input;