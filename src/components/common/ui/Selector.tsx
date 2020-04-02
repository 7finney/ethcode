import React, { Component } from 'react';
import Select from 'react-select';

interface IProps {
  options: any;
  getSelectedOption: any;
  placeholder: string;
  defaultValue?: any | undefined;
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
    menu: "20px",
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

class Selector extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      selectedOption: null,
      options: []
    };
  }

  public componentDidMount() {
    const { defaultValue, options } = this.props;

    this.setState({
      options,
      selectedOption: defaultValue
    })
  }

  public componentDidUpdate(prevProps: any, preState: any) {
    const { options, defaultValue } = this.props;

    if (prevProps.defaultValue !== defaultValue && preState.defaultValue !== defaultValue) {
      this.setState({
        selectedOption: defaultValue
      })
    }

    if (options !== prevProps.options) {
      this.setState({
        options
      })
    }
  }

  public componentWillUnmount() {
    this.setState({ selectedOption: null, options: [] });
  }

  handleChange = (selectedOption: any) => {
    this.setState({ selectedOption }, () => {
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
          className="select-width"
          styles={customStyles}
        />
    );
  }
}

export default Selector;