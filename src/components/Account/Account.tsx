import React, { Component } from "react";
import "./Account.css";
import Selector from '../Selector';

interface IProps {
}

interface IState {
}


class Account extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
    };
  }

  getSelectedAccount =  (value: any) => {
    console.log("getSelectedAccount");
  }

  public render() {
    return (
      <div className="account-container">
        <div className="row">
          <div>Select Account</div>
          <Selector
            getSelectedOption={this.getSelectedAccount}
            options={[]}
            placeholder='Select Account'
            defaultValue={[]}
          />
        </div>
      </div>
    );
  }
}

export default Account;