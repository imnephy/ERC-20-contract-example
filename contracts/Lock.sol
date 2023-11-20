// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Lock is ERC20 {
    uint256 public maxTotalSupply;
    address public admin;

    constructor(uint256 _maxTotalSupply, address[] memory initialAccounts, uint256 initialSupplyPerAccount) ERC20("MyToken", "MTK") {
        require(initialSupplyPerAccount * initialAccounts.length <= _maxTotalSupply, "Initial supply exceeds max total supply");
        admin = msg.sender;
        maxTotalSupply = _maxTotalSupply;

        for (uint256 i = 0; i < initialAccounts.length; i++) {
            _mint(initialAccounts[i], initialSupplyPerAccount);
        }
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function mint(address to, uint256 amount) public onlyAdmin {
        require(totalSupply() + amount <= maxTotalSupply, "Exceeds max total supply");
        _mint(to, amount);
    }
}
