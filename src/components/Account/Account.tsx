import React, { Component } from "react";
import "./Account.css";

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

  public render() {
    return (
      <div className="account-container">
        Account System
      </div>
    );
  }
}

export default Account;