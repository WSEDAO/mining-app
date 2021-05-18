const { assert } = require("chai");

var Token = artifacts.require("./RewardToken.sol");
contract('ERC20Managable', function(accounts) {
        it("right deploy parameters", async function() {
            let token = await Token.deployed()
            let name = await token.call('name')
            let symbol = await token.symbol.call()
            assert.equal(name, "WSEDAO", "Wrong name set")
            assert.equal(symbol, "WSD", "Wrong symbol set")
        })
        it("transfer", async function() {
            let token = await Token.deployed()
            await token.transfer(accounts[1], 1)
            let receiverBalance = await token.balanceOf.call(accounts[1])
            assert.equal("1", receiverBalance.toString(), "Transfered wrong amount")
        })
        it("pause - not transfer allowed", async function() {
            let token = await Token.deployed()
            await token.pause()
            try {
                await token.transfer(accounts[1], 1)
                assert.fail()
            } catch(e) {
                let receiverBalance = await token.balanceOf.call(accounts[1])
                assert.equal("1", receiverBalance.toString(), "Transfer should be reverted while paused")
            }
            
            let paused = await token.call("paused")
            assert.isTrue(paused, "Contract should be paused")
        })
        it("unpause - transfer allowed", async function() {
            let token = await Token.deployed()
            await token.unpause()
            await token.transfer(accounts[1], 1)
            let receiverBalance = await token.balanceOf.call(accounts[1])
            let paused = await token.call("paused")
            assert.equal(2, receiverBalance, "Transfer should be reverted while paused")
            assert.isFalse(paused, "Contract should unpaused")
        })
        it("blacklist account", async function() {
            let token = await Token.deployed()
            await token.blacklistAccount(accounts[1], true)
            let initialBalance = await token.balanceOf.call(accounts[1])
            try {
                await token.transfer(accounts[1], 1)
                assert.fail()
            } catch(e){
                let receiverBalance = await token.balanceOf.call(accounts[1])
                assert.equal(initialBalance.toNumber(), receiverBalance.toNumber(), "Transfer to blacklisted account shoud be forbidden")
            }

            try {
                await token.transfer(accounts[0], 1, {from: accounts[1]})
                assert.fail()
            } catch(e){
                let senderBalance = await token.balanceOf.call(accounts[1])
                assert.equal(initialBalance.toNumber(), senderBalance.toNumber(), "Transfer from blacklisted account shoud be forbidden")
            }
        })

        it("unblacklist account", async function() {
            let token = await Token.deployed()
            await token.blacklistAccount(accounts[1], false)
            await token.transfer(accounts[1], 1)
            await token.transfer(accounts[0], 1, {from: accounts[1]})
        })
});
