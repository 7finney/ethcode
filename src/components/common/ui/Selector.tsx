import React, { useState, useEffect } from "react";
import Select, {ValueType} from "react-select";
import { IAccount } from "types";

interface IProps {
  options: any;
  getSelectedOption: (value: any) => void;
  placeholder: string;
  defaultValue?: any | undefined;
  formatGroupLabel?: any;
}

const customStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "#000",
    color: "#fff",
    menu: "20px",
    borderColor: "#38ffAf",
  }),

  menu: (base: any) => ({
    ...base,
    color: "#fff",
    background: "#000",
  }),
  menuList: (base: any) => ({
    ...base,
    color: "#fff",
    background: "#000",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#fff",
  }),
  option: (base: any, { isFocused }: any) => ({
    ...base,
    color: "#fff",
    backgroundColor: isFocused ? "#aaa" : null,
  })
};

const Selector: React.FC<IProps> = (props: IProps) => {
  const [selectedOption, setSelectedOption] = useState<IAccount|null>(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setSelectedOption(props.defaultValue);
    setOptions(props.options);
  }, [props.options]);

  useEffect(() => {
    return () => {
      setOptions([]);
      setSelectedOption(null);
    };
  }, []);

  useEffect(() => {
    if (selectedOption) props.getSelectedOption(selectedOption);
  }, [selectedOption]);

  const handleChange = (selectedAcc: IAccount) => {
    setSelectedOption(selectedAcc);
  };

  return (
    <Select
      placeholder={props.placeholder}
      value={selectedOption}
      onChange={(option: ValueType<IAccount>) => handleChange(option as IAccount)}
      options={options}
      formatGroupLabel={props.formatGroupLabel}
      className="select-width"
      styles={customStyles}
    />
  );
};

Selector.defaultProps = {
  defaultValue: null,
};

export default Selector;
