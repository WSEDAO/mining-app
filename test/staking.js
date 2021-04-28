const { assert, expect } = require("chai");
var RewardToken = artifacts.require("./RewardToken.sol");
var StakingApp = artifacts.require("./StakingApp.sol");

const { keccak256 } = require('@ethersproject/keccak256');
const { defaultAbiCoder } =  require('@ethersproject/abi');
const { toUtf8Bytes } = require('@ethersproject/strings');
const { toHex } = require('tron-format-address');
const { pack } = require('@ethersproject/solidity');
const { ecsign } = require('ethereumjs-util');
const { hexlify } = require('@ethersproject/bytes');

const DECIMALS = '000000000000000000'
const PERMIT_TYPEHASH = keccak256(
    toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

function getDomainSeparator(name, contractAddress) {
    return keccak256(
      defaultAbiCoder.encode(
        ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
        [
          keccak256(toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
          keccak256(toUtf8Bytes(name)),
          keccak256(toUtf8Bytes('1')),
          1551,
          contractAddress
        ]
      )
    )
}

function convertTronAddress2Eth(tronAddress) {
      const result =  '0x' + tronAddress.slice(2)
      return result
}

function getApprovalDigest(
    contractName,
    contractAddress,
    owner,
    spender,
    value,
    nonce,
    deadline) {
    const DOMAIN_SEPARATOR = getDomainSeparator(contractName, contractAddress)
    return keccak256(
        pack(
        ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
        [
          '0x19',
          '0x01',
          DOMAIN_SEPARATOR,
          keccak256(
            defaultAbiCoder.encode(
              ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
              [PERMIT_TYPEHASH, owner, spender, value, nonce, deadline]
            )
          )
        ]
      )
    )
}


contract('MLM Staking', function(accounts) {
    let owner = accounts[0]
    let receiver = accounts[1]

    it('stake tokens', async () => {
        let dapp = await StakingApp.deployed()
        let rewardToken = await RewardToken.deployed()
        const stakeAmount = "100" + DECIMALS
        await rewardToken.mint(owner, stakeAmount)
        await rewardToken.approve(dapp.address, stakeAmount)

        assert.equal(await dapp.staked.call(owner), 0, "No tokens staked initialy.")
        await dapp.stake(stakeAmount)
        assert.equal((await dapp.staked.call(owner)).toString(), stakeAmount, "Wrong amount of staked tokens.")
    })

    it('test approval', async () => {
        let dapp = await StakingApp.deployed()
        let rewardToken = await RewardToken.deployed()
        const rewardAmount = "100" + DECIMALS
        await rewardToken.mint(dapp.address, rewardAmount)

        const deadline = 999999999
        const ownersPriKey = '80dfbd041bee76bd48424d29c451ff6a51b10624d7a26b496fa45a382efb9f9c' //evidence easy grief keen hurdle suggest topple aunt wealth news burden seven
        const digest = getApprovalDigest(
            "WSEDAO Staking",
            convertTronAddress2Eth(dapp.address), 
            convertTronAddress2Eth(toHex(owner)), 
            convertTronAddress2Eth(toHex(receiver)), 
            rewardAmount,
            await dapp.nonces.call(owner),
            deadline
        )
        const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(ownersPriKey, 'hex'))
            
        await dapp.withdrawReward(rewardAmount, deadline, v, hexlify(r), hexlify(s), {from: receiver})
        assert.equal((await rewardToken.balanceOf.call(receiver)).toString(), rewardAmount, "Reward withdraw error.")

    })
})