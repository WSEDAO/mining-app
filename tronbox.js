const port = process.env.HOST_PORT || 9090

module.exports = {
  networks: {
    mainnet: {
      // Don't put your private key here:
      privateKey: '5cfd915c49b25441c2e838b7acb5fc6fadaa11a54966fb1547f1c57400310b8d',
      /*
Create a .env file (it must be gitignored) containing something like

  export PRIVATE_KEY_MAINNET=5cfd915c49b25441c2e838b7acb5fc6fadaa11a54966fb1547f1c57400310b8d

Then, run the migration with:

  source .env && tronbox migrate --network mainnet

*/
      userFeePercentage: 100,
      feeLimit: 1e9,
      fullHost: 'https://api.trongrid.io',
      network_id: '1'
    },
    shasta: {
      privateKey: '5cfd915c49b25441c2e838b7acb5fc6fadaa11a54966fb1547f1c57400310b8d',
      userFeePercentage: 100,
      feeLimit: 345000000,
      fullHost: 'https://api.shasta.trongrid.io',
      network_id: '2'
    },
    nile: {
      privateKey: '5cfd915c49b25441c2e838b7acb5fc6fadaa11a54966fb1547f1c57400310b8d',
      userFeePercentage: 100,
      feeLimit: 1e8,
      fullHost: 'https://api.nileex.io',
      network_id: '3'
    },
    development: {
      // For trontools/quickstart docker image
      privateKey: 'da146374a75310b9666e834ee4ad0866d6f4035967bfc76217c5a495fff9f0d0',
      userFeePercentage: 0,
      feeLimit: 245000000, //145000000
      fullHost: 'http://127.0.0.1:' + port,
      network_id: "9",
      solc: {
        version: '0.5.10'
      }
    },
    compilers: {
      solc: {
        version: '0.5.10'
      }
    }
  }
}
