pragma solidity ^0.5.10;

import "./Ownable.sol";
import "./TRC20Managable.sol";
import "./SafeMath.sol";

/**
 * @title Dapp for CLR and WSEDAO tokesn
 */
contract StakingApp is Ownable {
    using SafeMath for uint256;

    TRC20Managable public stakingToken;

    mapping(address => uint) public staked;
    mapping(address => uint) public rewardReceived;

    bytes32 public DOMAIN_SEPARATOR;
    // keccak256("Permit(address owner,address spender,uint256 package,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH = 0x65ad8b067c3f44412403886927c7578708b814943af80f48764dc4b9450c01ee;
    mapping(address => uint) public nonces;

    event Stake(uint package, address indexed account, uint amount);
    event RewardReceived(uint package,address indexed account, uint amount);

    constructor(address _stakingToken) public {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes("WSEDAO Staking")),
                keccak256(bytes('1')),
                1551,
                address(this)
            )
        );

        stakingToken = TRC20Managable(_stakingToken);
    }


    function stake(uint package, uint amount) public {
        stakingToken.transferFrom(msg.sender, address(this), amount);
        staked[msg.sender] = staked[msg.sender].add(amount);
        emit Stake(package, msg.sender, amount);
    }

    function withdrawReward(uint package, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) public {
        require(deadline >= block.timestamp, 'Withdraw expired.');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PERMIT_TYPEHASH, owner(), msg.sender, package, value, nonces[msg.sender]++, deadline))
            )
        );

        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner(), 'Invalid signature.');

        stakingToken.transfer(msg.sender, value);
        rewardReceived[msg.sender] = rewardReceived[msg.sender].add(value);
        emit RewardReceived(package, msg.sender, value);
    }

}