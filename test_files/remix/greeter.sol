// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

contract Greeter {
    /* Define variable greeting of the type string */
    string greeting;

    /* This runs when the contract is executed */
    constructor(string memory _greeting) public {
        greeting = _greeting;
    }

    /* Main function */
    function greet() public view returns (string memory) {
        return greeting;
    }

    function getGreetPublic(string memory _greeting)
        public 
        view
        returns (string memory)
    {
        return _greeting;
    }

    function setGreetPublic(string memory _greeting) public {
        greeting = _greeting;
    }
}
