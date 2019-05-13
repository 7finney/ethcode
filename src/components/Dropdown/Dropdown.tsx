// @ts-ignore
import React, { Component } from "react";
// @ts-ignore
import Select from "react-select";
import "./Dropdown.css";

interface IProps {
  files: any;
  changeFile: (val: any) => void;
}
interface IOpt {
  value: string;
  label: string;
}
interface IState {
  selectedOption: any;
  options: IOpt[];
}
class Dropdown extends Component<IProps, IState> {
  public state = {
    selectedOption: null,
    options: new Array()
  };
  constructor(props: IProps) {
    super(props);
    const { options } = this.state;
    props.files.map((file: string) => {
      const optItm: IOpt = {
        value: file,
        label: file.replace(/^.*[\\\/]/, "")
      };
      options.push(optItm);
    });
  }
  public componentWillUnmount() {
    this.setState({ selectedOption: null, options: new Array() });
  }
  public handleChange = (selectedOption: any) => {
    this.setState({ selectedOption });
    this.props.changeFile(selectedOption);
  };
  public render() {
    const { selectedOption } = this.state;
    return (
      <Select
        value={selectedOption}
        onChange={this.handleChange}
        options={this.state.options}
        className="optStyle"
      />
    );
  }
}
export default Dropdown;
