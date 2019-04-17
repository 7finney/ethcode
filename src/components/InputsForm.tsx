// @ts-ignore
import React, { Component } from 'react';

interface IProps {
    contractName: string,
    abi: any,
    onSubmit: () => void
}
class InputsForm extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
        this._handleChange = this._handleChange.bind(this);
    }
    public _handleChange(input: any, event: any) {
        input.value = event.target.value;
    }
    public render() {
        const { contractName, abi } = this.props;

        return (
            <div id={contractName + '_inputs'}>
            {
                abi.type === 'constructor' &&
                abi.inputs.map((input: any, i: string) => {
                    return(
                        <form key={i} onSubmit={this.props.onSubmit}>
                            <button className="input text-subtle">{ input.name }</button>
                            <input
                                id={i} type="text" className="inputs" placeholder={input.type}
                                value={input.value}
                                onChange={(e) => this._handleChange(input, e)}
                            />
                        </form>
                    )
                })
            }
            </div>
        )
    }
}

export default InputsForm;