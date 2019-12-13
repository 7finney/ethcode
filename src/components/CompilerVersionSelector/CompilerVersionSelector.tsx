import React, { Component } from "react";
// @ts-ignore
import Select from "react-select";

interface IProps {
  availableVersions: any;
  getSelectedVersion: any;
}
interface IOpt {
  value: string;
  label: string;
}

interface IState {
  availableVersions: any[];
  selectedVersion: any;
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

class CompilerVersionSelector extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      availableVersions: [],
      selectedVersion: "",
      options: []
    };

    this._handleVersionSelector = this._handleVersionSelector.bind(this);
  }
  public async _handleVersionSelector(selectedVersion: any) {
    await this.setState({ selectedVersion });
    this.props.getSelectedVersion(this.state.selectedVersion);
  }

  public componentDidMount() {
    const options: any = [];
    Object.keys(this.props.availableVersions).reverse().map((v: any, i: any) => {
      const optItm: IOpt = {
        value: this.props.availableVersions[v]
          .split("soljson-")[1]
          .split(".js")[0],
        label: v
      };
      return options.push(optItm);
      
    });
    this.setState({ options });
  }
  public render() {
    const { selectedVersion } = this.state;
    return (
      <div className="content">
        <div style={{ marginBottom: '30px' }}>
          <Select
            placeholder="Select Compiler Version"
            value={selectedVersion}
            onChange={this._handleVersionSelector}
            options={this.state.options}
            className="select-width"
            styles={customStyles}
          />
        </div>
      </div>
    );
  }
}

export default CompilerVersionSelector;
