pragma solidity ^0.5.10;

import "./TRC20Managable.sol";

contract RewardToken is TRC20Managable {
    constructor() TRC20Managable("WSEDAO", "WSD", 18) public {
        _mint(msg.sender, 21000000000000000000000000);
    }
}