// @ts-ignore
import React, { Component } from "react";
import "./Dropdown.css";

type IProps = any;
// @ts-ignore
interface IState {
  sources: any;
}
class Dropdown extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      sources: this.props.files
    };
  }
  public renderProps() {
    return this.props.files.map((file: any) => (
      <option value={file} key={file}>{file}</option>
    ))
  }
  public render() {
    return (
      <div>
        <select name="files" id="compiledFiles">
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
