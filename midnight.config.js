module.exports = {
  networks: {
    preprod: {
      indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
      indexerWs: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
      node: 'https://rpc.preprod.midnight.network',
      proofServer: 'http://127.0.0.1:6300'
    }
  },
  contracts: {
    anonpay: './contracts/anonpay.compact'
  },
  output: './contracts/managed',
  network: 'preprod'
};