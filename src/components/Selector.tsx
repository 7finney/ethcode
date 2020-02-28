import React, { Component } from 'react';
import Select from 'react-select';

interface IProps {
  options: any;
  getSelectedOption: any;
  placeholder: string;
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

  componentDidMount() {
    this.setState({ options: this.props.options })
  }

  handleChange = (selectedOption: any) => {
    this.setState({ selectedOption },() => {
      console.log(`Option selected:`, selectedOption);
      this.props.getSelectedOption(this.state.selectedOption);
    });
  };

  render() {
    const { selectedOption, options } = this.state;
    const { placeholder } = this.props;
 
    return (
      <Select
        placeholder={placeholder}
        value={selectedOption}
        onChange={this.handleChange}
        options={options}
      />
    );
  }
}

export default Selector;  