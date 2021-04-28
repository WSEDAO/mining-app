pragma solidity ^0.5.10;

import "./TRC20Managable.sol";

contract BurnToken is TRC20Managable {
    constructor() TRC20Managable("CaLoRie", "CLR", 18) public {

    }
}