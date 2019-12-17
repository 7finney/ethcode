// @ts-ignore
import React, { Component } from "react";
// @ts-ignore
import Select from "react-select";

interface IProps {
  contractName: any;
  changeContract: (val: any) => void;
}
interface IOpt {
  value: string;
  label: string;
}
interface IState {
  selectedOption: any;
  options: IOpt[];
}

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "#000",
    color: "#fff",
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

class ContractSelector extends Component<IProps, IState> {
  public state = {
    selectedOption: null,
    options: new Array<IOpt>()
  };
  constructor(props: IProps) {
    super(props);
    const { options } = this.state;
    props.contractName.map((name: string) => {
      const optItm: IOpt = {
        value: name,
        label: name
      };
      return options.push(optItm);
    });
  }

  public handleChange = (selectedOption: any) => {
    this.setState({ selectedOption });
    this.props.changeContract(selectedOption);
  };

  public render() {
    const { selectedOption, options } = this.state;

    return (
      <div style={{ marginBottom: '30px', position: 'absolute' }}>
        <Select
          placeholder="Select Contract"
          value={selectedOption}
          onChange={this.handleChange}
          options={options}
          className="select-width"
          styles={customStyles}
        />
      </div>
    );
  }

}

export default ContractSelector;
