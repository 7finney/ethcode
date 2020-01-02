import React, { Component } from "react";
// @ts-ignore
import Select from "react-select";

interface IProps {
  availableAccounts: string[];
  getSelectedAccount: any;
}
interface IOpt {
  value: string;
  label: string;
}

interface IState {
  availableAccounts: string[];
  selectedAccount: any;
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

class AccountsSelector extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      availableAccounts: [],
      selectedAccount: "",
      options: []
    };

    this._handleAccountSelector = this._handleAccountSelector.bind(this);
  }

  componentDidMount() {
    const options: any = [];
    const { availableAccounts } = this.props

      availableAccounts.map((name: string) => {
        const optItm: IOpt = {
          value: name,
          label: name
        };
        return options.push(optItm);
      });
      this.setState({ options })
  }

  componentDidUpdate(prevProps: any) {
    const options: any = [];
    const { availableAccounts } = this.props

    if (this.props !== prevProps) {
      availableAccounts.map((name: string) => {
        const optItm: IOpt = {
          value: name,
          label: name
        };
        return options.push(optItm);
      });
      this.setState({ options })
    }
  }

  public async _handleAccountSelector(selectedAccount: any) {
    await this.setState({ selectedAccount });
    this.props.getSelectedAccount(this.state.selectedAccount.value);
  }

  public render() {
    const { selectedAccount, options } = this.state;
    
    return (
      <div className="content">
        <div style={{ marginBottom: '30px' }}>
          <Select
            placeholder="Select Accounts"
            value={selectedAccount}
            onChange={this._handleAccountSelector}
            options={options}
            className="select-width-account"
            styles={customStyles}
          />
        </div>
      </div>
    );
  }
}

export default AccountsSelector;
