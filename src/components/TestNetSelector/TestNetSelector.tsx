import React, { Component } from "react";
// @ts-ignore
import Select from "react-select";

interface IProps {
  getSelectedNetwork: any;
}
interface IOpt {
  value: string;
  label: string;
}

interface IState {
  selectedNetwork: any;
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

class TestNetSelector extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedNetwork: "",
      options: [
        { value: 'ganache', label: 'Ganache'},
        { value: '3', label: 'Ropsten' },
        { value: '4', label: 'Rinkeby' },
        { value: '5', label: "Goerli" },
        { value: '6', label: 'Prysm-Sapphire' },
      ]
    };

    this._handleNetworkSelector = this._handleNetworkSelector.bind(this);
  }

  public async _handleNetworkSelector(selectedNetwork: any) {
    await this.setState({ selectedNetwork });
    this.props.getSelectedNetwork(this.state.selectedNetwork.value);
  }

  public render() {
    const { selectedNetwork, options } = this.state;

    return (
      <div className="content">
        <div style={{ marginBottom: '30px' }}>
          <Select
            placeholder="Select Network"
            value={selectedNetwork}
            onChange={this._handleNetworkSelector}
            options={options}
            className="select-width-account"
            styles={customStyles}
          />
        </div>
      </div>
    );
  }
}

export default TestNetSelector;
