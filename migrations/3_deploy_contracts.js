const ProductTraceability = artifacts.require("ProductTraceability.sol");

module.exports = function(deployer) {
  deployer.deploy(ProductTraceability);
};
