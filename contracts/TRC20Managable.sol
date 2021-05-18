pragma solidity ^0.5.10;

import "./TRC20Detailed.sol";
import "./Ownable.sol";

/**
 * @title TRC20Managable token
 */
contract TRC20Managable is TRC20Detailed, Ownable {

    bool public paused;
    mapping(address => bool) private _blacklist;

    constructor (string memory name, string memory symbol, uint8 decimals) TRC20Detailed(name, symbol, decimals) public {
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function blacklistAccount(address account, bool sign) external onlyOwner {
        _blacklist[account] = sign;
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function isBlacklisted(address account) public view returns(bool) {
        return _blacklist[account];
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(paused == false);
        require(!isBlacklisted(from));
        require(!isBlacklisted(to));
        require(!isBlacklisted(msg.sender));
        super._transfer(from, to, value);
    }
}