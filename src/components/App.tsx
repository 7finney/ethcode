// @ts-ignore
import React, { Component } from 'react';
import { Collapse } from 'react-collapse';
import '../css/App.css';
import ContractCompiled from './ContractCompiled';

type IProps = any
interface IState {
  message: string,
  compiled: any,
  error: Error | null
}
// @ts-ignore
const vscode = acquireVsCodeApi();
class App extends Component<IProps, IState> {
  public state: IState
  public props: IProps

  constructor(props: IProps) {
    super(props)
    this.state = {
      message: '',
      compiled: '',
      error: null
    }
  }
  public componentDidMount() {
    window.addEventListener('message', event => {
      const { data } = event;
      if(data.compiled) {
        const compiled = JSON.parse(data.compiled)
        console.log(Object.keys(compiled.sources));
        this.setState({ compiled });
      }
      // TODO: handle error message
    });
  }
  public render() {
    const { compiled, message } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">ETHcode</h1>
        </header>
        <pre>
          {
            message
          }
        </pre>
        <p>
          {
            compiled &&
            Object.keys(compiled.sources).map((fileName: string, index: number) => {
              return(
                <Collapse isOpened={true} key={index}>
                  {
                    Object.keys(compiled.contracts[fileName]).map((contractName: string, i: number) => {
                      const bytecode = compiled.contracts[fileName][contractName].evm.bytecode.object;
                      const ContractABI = compiled.contracts[fileName][contractName].abi;
                        return (
                            <div id={contractName} className="contract-container" key={index}>
                                {
                                    <ContractCompiled
                                        contractName={contractName}
                                        bytecode={bytecode}
                                        abi={ContractABI}
                                    />
                                }
                            </div>
                        );
                    })
                    }
                </Collapse>
              )
            })
          }
        </p>
      </div>
    );
  }
}

export default App;
