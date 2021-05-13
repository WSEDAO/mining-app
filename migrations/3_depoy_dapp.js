var RewardToken = artifacts.require("./RewardToken.sol");
var BurnToken = artifacts.require("./BurnToken.sol");
var Dapp = artifacts.require("./Dapp.sol");
var StakingApp = artifacts.require("./StakingApp.sol");

var DECIMALS = '000000000000000000'

module.exports = async function(deployer, net, account) {
  return deployer.deploy(RewardToken).then(
      (rewardToken) => {
        return deployer.deploy(BurnToken).then(
            (burnToken) => {
                return deployer.deploy(Dapp, rewardToken.address, burnToken.address).then(
                  () => {
                    return deployer.deploy(StakingApp, rewardToken.address)
                  }
                )
            }
        )
      }
  )
};