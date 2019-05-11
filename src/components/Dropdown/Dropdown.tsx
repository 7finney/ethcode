// @ts-ignore
import React, { Component } from "react";
import "./Dropdown.css";

interface IProps {
  files: any;
  changeFile: (val: any) => void;
}
// @ts-ignore
interface IState {
  value: any;
}
class Dropdown extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      value: "No Files"
    };
  }
  public handleChange = (e: any) => {
    this.setState({ value: e.target.value });
    this.props.changeFile(this.state.value)
  };
  public renderProps() {
    return this.props.files.map((file: any) => (
      <option value={file} key={file}>
        {file}
      </option>
    ));
  }
  public render() {
    return (
      <div>
        <select
          id="compiledFiles"
          value={this.state.value}
          onChange={this.handleChange}
        >
          <option value="No Files" selected={true} disabled={true}>
            No Files
          </option>
          {this.renderProps()}
        </select>
      </div>
    );
  }
}

export default Dropdown;
