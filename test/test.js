const { assert } = require("chai");

var Token = artifacts.require("./TRC20Managable.sol");
contract('ERC20Managable', function(accounts) {
        it("right deploy parameters", async function() {
            let token = await Token.deployed()
            let name = await token.call('name')
            let symbol = await token.symbol.call()
            assert.equal(name, "a", "Wrong name set")
            assert.equal(symbol, "b", "Wrong symbol set")
        })
        it("minted expected amount", async function() {
            let token = await Token.deployed()
            await token.mint(accounts[0], 100)
            let newBalance = await token.balanceOf.call(accounts[0])
            assert.equal(100, newBalance, "Minted wrong amount")

            try{
                await token.mint(accounts[0], 100, {from: accounts[1]})
            } catch(e){}
            newBalance = await token.balanceOf.call(accounts[0])
            assert.equal(100, newBalance, "Only owner should be able to mint amount")

        })
        it("transfer", async function() {
            let token = await Token.deployed()
            await token.transfer(accounts[1], 1)
            let receiverBalance = await token.balanceOf.call(accounts[1])
            assert.equal(1, receiverBalance, "Transfered wrong amount")
        })
        it("pause - not transfer allowed", async function() {
            let token = await Token.deployed()
            await token.pause()
            try {
                await token.transfer(accounts[1], 1)
                assert.fail()
            } catch(e) {
                let receiverBalance = await token.balanceOf.call(accounts[1])
                assert.equal(1, receiverBalance, "Transfer should be reverted while paused")
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

        it("force transfer", async function() {
            let token = await Token.deployed()
            let initialBalance = await token.balanceOf.call(accounts[1])
            await token.forceTransfer(accounts[1], accounts[0], 1)
            let changedBalance = await token.balanceOf.call(accounts[1])
            assert.equal(changedBalance.toNumber(), initialBalance.toNumber() - 1, "Owner cannot make force transfer")

            initialBalance = changedBalance
            try {
                await token.forceTransfer(accounts[0], accounts[1], 1, {from: accounts[1]})
            } catch(e) {
                changedBalance = await token.balanceOf.call(accounts[1])
                assert.equal(changedBalance.toNumber(), initialBalance.toNumber(), "Not Owner can make force transfer")
            }
        })
});
