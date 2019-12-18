import React, { Component } from "react";
// @ts-ignore
import Select from "react-select";

interface IProps {
  availableAccounts: any;
  currAccountBalance: any;
  getSelectedAccount: any;
}
interface IOpt {
  value: string;
  label: string;
}

interface IState {
  availableAccounts: any[];
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
  public async _handleAccountSelector(selectedAccount: any) {
    await this.setState({ selectedAccount });
    this.props.getSelectedAccount(this.state.selectedAccount);
  }

  // public componentDidMount() {
  //   const options: any = [];
  //   console.log("accounts:\n")
  //   console.dir(JSON.stringify(this.props.availableAccounts));    
  //   if(this.props.availableAccounts.length>0)Object.keys(this.props.availableAccounts).map((v: any, i: any) => {
  //     const optItm: IOpt = {
  //       value: this.props.availableAccounts[v],
  //       label: v
  //     };
  //     return options.push(optItm);
  //   });
  //   console.log("hhhhhhhhhhhhhhhhhhhhhhhhhh")
  //   console.dir(JSON.stringify(options));
    
  //   this.setState({ options: options });
  // }
  public render() {
    const { selectedAccount, options } = this.state;
    console.log("hjhhhhhhhhhhhhhhh")
    console.dir(JSON.stringify(options));
    
    return (
      <div className="content">
        <div style={{ marginBottom: '30px' }}>
          <Select
            placeholder="Select Compiler Version"
            value={selectedAccount}
            onChange={this._handleAccountSelector}
            options={options}
            className="select-width"
            styles={customStyles}
          />
        </div>
      </div>
    );
  }
}

export default AccountsSelector;
