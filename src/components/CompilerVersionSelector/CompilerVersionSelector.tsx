// @ts-ignore
import React, { Component } from "react";
// @ts-ignore
import Select from "react-select";

// import PropTypes from "prop-types";
// import { connect } from "react-redux";

type IProps = any;

interface IOpt {
  value: string;
  label: string;
}

interface IState {
  availableVersions: any[];
  selectedVersion: string;
  options: IOpt[];
}

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    backgroundColor: "#000",
    color: "#fff"
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
  public web3: any;
  constructor(props: IProps) {
    super(props);
    this.web3 = props.web3;
    this.state = {
      availableVersions: [],
      selectedVersion: "",
      options: new Array()
    };
    const { options } = this.state;

    this._handleVersionSelector = this._handleVersionSelector.bind(this);
    props.availableVersions.map((v: string) => {
      const optItm: IOpt = {
        value: v.split("soljson-")[1].split(".js")[0],
        label: v
      };
      options.push(optItm);
    });
  }
  public async _handleVersionSelector(event: any) {
    const selectedVersion = event.target.value;
    await this.setState({ selectedVersion });
    // atom.config.set("etheratom.versionSelector", selectedVersion);
  }
  

  // public async fetchVersionList() {
  //   try {
  //     const versions = await axios.get(
  //       "https://ethereum.github.io/solc-bin/bin/list.json"
  //     );
  //     this.setState({
  //       availableVersions: versions.data.releases
  //       //   selectedVersion: atom.config.get("etheratom.versionSelector")
  //     });
  //   } catch (error) {
  //     console.log("axios error", error);
  //   }
  // }
  // public renderList() {
  //   const { availableVersions } = this.state;
  //   return Object.keys(availableVersions).map((key, i) => {
  //     return (
  //       <option key={i} value={}>
  //         {availableVersions[key]}
  //       </option>
  //     );
  //   });
  // }
  public render() {
    const { selectedVersion } = this.state;
    return (
      <div className="content">
        <div className="row">
          <Select
            placeholder="Select Compiler Version"
            value={selectedVersion}
            onChange={this._handleVersionSelector}
            options={this.state.options}
            className="optStyle"
            styles={customStyles}
          />
        </div>
      </div>
    );
  }
}

// VersionSelector.propTypes = {
//   web3: PropTypes.any.isRequired,
//   selectedVersion: PropTypes.string
// };

// const mapStateToProps = ({ contract }) => {
//   const { selectedVersion } = contract;
//   return { selectedVersion };
// };

export default CompilerVersionSelector;
