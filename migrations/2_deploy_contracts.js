var Token = artifacts.require("./TRC20Managable.sol");

var DECIMALS = '000000000000000000'
module.exports = async function(deployer, net, account) {
  deployer.deploy(Token, "a", "b", 18);
};