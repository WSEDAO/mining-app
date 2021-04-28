const { assert, expect } = require("chai");
var RewardToken = artifacts.require("./RewardToken.sol");
var BurnToken = artifacts.require("./BurnToken.sol");
var Dapp = artifacts.require("./Dapp.sol");

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


contract('MLM Dapp', function(accounts) {
    let owner = accounts[0]
    let newbie = accounts[1]

    it('register account', async () => {
        // let l = await RewardToken.deployed()
        let dapp = await Dapp.deployed()
        assert.isFalse(await dapp.registered.call(owner), "Account shouldn't be already registered")
        await dapp.registerAccount('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb') // T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb == address(0)
        assert.isTrue(await dapp.registered.call(owner), "Account should be already registered")
    })

    it('register with referral', async () => {
        let dapp = await Dapp.deployed()
        assert.isFalse(await dapp.registered.call(newbie), "Account shouldn't be already registered")
        await dapp.registerAccount(owner, {from: newbie})
        assert.isTrue(await dapp.registered.call(newbie), "Account should be already registered")
    })

    it('burn tokens', async () => {
        let dapp = await Dapp.deployed()
        let burnToken = await BurnToken.deployed()
        const burnAmount = "100" + DECIMALS
        await burnToken.mint(owner, burnAmount)
        await burnToken.approve(dapp.address, burnAmount)

        assert.equal(await dapp.burnedTokens.call(owner), 0, "No tokens should be burned initialy.")
        await dapp.acquireHashPower(burnAmount)
        assert.equal((await dapp.burnedTokens.call(owner)).toString(), burnAmount, "Wrong amount of burned tokens.")
    })

    it('test approval', async () => {
    let dapp = await Dapp.deployed()
    let rewardToken = await RewardToken.deployed()
    const rewardAmount = "100" + DECIMALS
    await rewardToken.mint(dapp.address, rewardAmount)

    const deadline = 999999999
    const ownersPriKey = '80dfbd041bee76bd48424d29c451ff6a51b10624d7a26b496fa45a382efb9f9c' //evidence easy grief keen hurdle suggest topple aunt wealth news burden seven
    const digest = getApprovalDigest(
        "WSEDAO Dapp",
        convertTronAddress2Eth(dapp.address), 
        convertTronAddress2Eth(toHex(owner)), 
        convertTronAddress2Eth(toHex(owner)), 
        rewardAmount,
        await dapp.nonces.call(owner),
        deadline
    )
    const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(ownersPriKey, 'hex'))
        
    await dapp.withdrawReward(rewardAmount, deadline, v, hexlify(r), hexlify(s))
    assert.equal((await rewardToken.balanceOf.call(owner)).toString(), rewardAmount, "Reward withdraw error.")

    })
})