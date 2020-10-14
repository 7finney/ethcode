import React, { useState, useEffect } from "react";
import Select from "react-select";

interface IProps {
  options: any;
  getSelectedOption: any;
  placeholder: string;
  defaultValue?: any | undefined;
}

const customStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "#000",
    color: "#fff",
    menu: "20px",
    borderColor: '#38ffAf'
  }),

  menu: (base: any) => ({
    ...base,
    color: "#fff",
    background: "#000"
  }),
  menuList: (base: any) => ({
    ...base,
    color: "#fff",
    background: "#000"
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#fff"
  }),
  option: (base: any, { isFocused }: any) => ({
    ...base,
    color: "#fff",
    backgroundColor: isFocused ? "#aaa" : null
  })
};

const Selector = (props: IProps) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);

  const { placeholder, defaultValue } = props;

  useEffect(() => {
    setSelectedOption(defaultValue);
    setOptions(props.options);
  }, [props.options]);

  useEffect(() => {
    return () => {
      setOptions([]);
      setSelectedOption(null);
    };
  }, []);

  const handleChange = (s: any) => {
    setSelectedOption(s);
    props.getSelectedOption(s);
  };

  return (
    <Select
      placeholder={placeholder}
      value={selectedOption}
      onChange={handleChange}
      options={options}
      className="select-width"
      styles={customStyles}
    />
  );
};

Selector.defaultProps = {
  defaultValue: null,
};

export default Selector;