// @ts-ignore
import React, { Component } from "react";
// import PropTypes from "prop-types";
// import { connect } from "react-redux";
import axios from "axios";

type IProps = any;
interface IState {
  availableVersions: any[];
  selectedVersion: string;
}

class CompilerVersionSelector extends Component<IProps, IState> {
  public web3: any;
  constructor(props: IProps) {
    super(props);
    this.web3 = props.web3;
    this.state = {
      availableVersions: [],
      selectedVersion: ""
    };
    this._handleVersionSelector = this._handleVersionSelector.bind(this);
  }
  public async _handleVersionSelector(event: any) {
    const selectedVersion = event.target.value;
    await this.setState({ selectedVersion });
    // atom.config.set("etheratom.versionSelector", selectedVersion);
  }
  public async componentDidMount() {
    window.addEventListener("message", event => {
      const { data } = event;
      if (data.versions) {
        this.setState({ availableVersions: data.versions });
      }
      console.log(this.state.availableVersions);
      
      // TODO: handle error message
    });
  }

  public async fetchVersionList() {
    try {
      const versions = await axios.get(
        "https://ethereum.github.io/solc-bin/bin/list.json"
      );
      this.setState({
        availableVersions: versions.data.releases
        //   selectedVersion: atom.config.get("etheratom.versionSelector")
      });
    } catch (error) {
      console.log("axios error", error);
    }
  }
  public render() {
    const { availableVersions } = this.state;
    return (
      <div className="content">
        <div className="row">
          <select
            onChange={this._handleVersionSelector}
            value={this.state.selectedVersion}
          >
            {Object.keys(availableVersions).map((key, i) => {
              return (
                <option
                  key={i}
                  value={
                    availableVersions[key].split("soljson-")[1].split(".js")[0]
                  }
                >
                  {availableVersions[key]}
                </option>
              );
            })}
          </select>
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
