import React, { Component } from 'react';
import Select from 'react-select';

interface IProps {
  availableVersions: any;
  getSelectedVersion: any;
}
interface IOpt {
  value: string;
  label: string;
}

interface IState {
  selectedOption: any;
  options: IOpt[];
}

 
class Selector extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedOption: null,
      options: [] 
    };
  }

  handleChange = (selectedOption: any) => {
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption);
  };

  render() {
    const { selectedOption, options } = this.state;
 
    return (
      <Select
        value={selectedOption}
        onChange={this.handleChange}
        options={options}
      />
    );
  }
}

export default Selector;  