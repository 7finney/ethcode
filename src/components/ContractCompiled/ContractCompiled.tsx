// @ts-ignore
import React, { Component } from 'react';
import InputsForm from '../InputsForm/InputsForm';

interface IProps {
    contractName: string,
    bytecode: any,
    abi: any
}
class ContractCompiled extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
    }
    public _handleInput() {
        console.log("Will handle input");
    }
    public render() {
        const { contractName, bytecode, abi } = this.props;
        return(
            <div>
                <span className="contract-name inline-block highlight-success">{ contractName }</span>
                <div className="byte-code">
                    <pre className="large-code">{ JSON.stringify(bytecode) }</pre>
                </div>
                <div className="abi-definition">
                    <pre className="large-code">{ JSON.stringify(abi) }</pre>
                </div>
                {
                    abi.map((abiItem: any, i: number) => {
                        return <InputsForm key={i} contractName={contractName} abi={abiItem} onSubmit={this._handleInput}/>;
                    })
                }
            </div>
        );
    }
}

export default ContractCompiled;