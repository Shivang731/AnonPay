import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { createKeystore, InMemoryTransactionHistoryStorage, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import * as Rx from 'rxjs';
import path from 'node:path';
import fs from 'node:fs';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';

globalThis.WebSocket = WebSocket;

const NETWORK_ID = 'preprod';
const INDEXER = 'https://indexer.preprod.midnight.network/api/v3/graphql';
const INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws';
const NODE = 'https://rpc.preprod.midnight.network';
const PROOF_SERVER = 'http://127.0.0.1:6300';
const CONTRACT_NAME = 'anonpay';

function loadActiveWallet() {
  const forgeDir = path.join(process.env.HOME, '.nightforge');
  const configPath = path.join(forgeDir, 'config.json');
  const walletsDir = path.join(forgeDir, 'wallets');

  const config = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : {};

  const preferredWallet = config.activeWallet
    ? path.join(walletsDir, `${config.activeWallet}.json`)
    : null;

  if (preferredWallet && fs.existsSync(preferredWallet)) {
    return JSON.parse(fs.readFileSync(preferredWallet, 'utf8'));
  }

  const walletFile = fs.readdirSync(walletsDir).find((file) => file.endsWith('.json'));
  if (!walletFile) {
    throw new Error('No Nightforge wallet found in ~/.nightforge/wallets');
  }

  return JSON.parse(fs.readFileSync(path.join(walletsDir, walletFile), 'utf8'));
}

// Load wallet
const walletDir = path.join(process.env.HOME, '.nightforge', 'wallets');
const walletData = loadActiveWallet();

if (walletData.network && walletData.network !== NETWORK_ID) {
  throw new Error(`Active wallet network mismatch: expected ${NETWORK_ID}, found ${walletData.network}`);
}

console.log(`Wallet: ${walletData.name} | ${walletData.address}`);

async function deploy() {
  setNetworkId(NETWORK_ID);

  // Load contract
  const zkConfigPath = path.resolve('contracts', 'managed', CONTRACT_NAME);
  const contractModule = await import(path.resolve(zkConfigPath, 'contract', 'index.js'));
  const compiledContract = CompiledContract.make(CONTRACT_NAME, contractModule.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );
  console.log('Contract loaded.');

  // Derive keys
  const keys = deriveKeysFromSeed(walletData.seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], getNetworkId());

  // Build wallet config
  const shieldedConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE.replace(/^http/, 'ws')),
  };
  const unshieldedConfig = {
    networkId: getNetworkId(),
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  };
  const dustConfig = {
    networkId: getNetworkId(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    indexerClientConnection: { indexerHttpUrl: INDEXER, indexerWsUrl: INDEXER_WS },
    provingServerUrl: new URL(PROOF_SERVER),
    relayURL: new URL(NODE.replace(/^http/, 'ws')),
  };

  const walletConfig = { ...shieldedConfig, ...unshieldedConfig, ...dustConfig };

  console.log('Initializing wallet...');
  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (cfg) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);
  console.log('Wallet started. Syncing...');

  // Wait for sync
  await Rx.firstValueFrom(wallet.state().pipe(Rx.throttleTime(5000), Rx.filter((s) => s.isSynced)));
  console.log('Wallet synced.');

  // Check balance
  let state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const balance = state.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
  console.log(`Balance: ${balance.toLocaleString()} tNight`);

  // Register for DUST if needed
  if (state.dust.availableCoins.length === 0) {
    const nightUtxos = state.unshielded.availableCoins.filter((c) => c.meta?.registeredForDustGeneration !== true);
    if (nightUtxos.length > 0) {
      console.log(`Registering ${nightUtxos.length} NIGHT UTXO(s) for DUST generation...`);
      const recipe = await wallet.registerNightUtxosForDustGeneration(
        nightUtxos, unshieldedKeystore.getPublicKey(), (p) => unshieldedKeystore.signData(p),
      );
      const finalized = await wallet.finalizeRecipe(recipe);
      await wallet.submitTransaction(finalized);
      console.log('Registration submitted.');
    }

    console.log('Waiting for DUST to generate...');
    await Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }

  state = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const dustBal = state.dust.balance(new Date());
  console.log(`DUST balance: ${dustBal.toLocaleString()}`);

  // Build providers
  const walletProvider = await createWalletAndMidnightProvider({ wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore });
  const accountId = walletProvider.getCoinPublicKey();
  const storagePassword = `${Buffer.from(accountId, 'hex').toString('base64')}!`;
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'anonpay-private-state',
      accountId,
      privateStoragePasswordProvider: () => storagePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(INDEXER, INDEXER_WS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(PROOF_SERVER, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  console.log('Deploying contract (30-60 seconds)...');
  const deployed = await deployContract(providers, {
    compiledContract,
    privateStateId: 'anonpayState',
    initialPrivateState: {},
    args: [],
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('\n=== CONTRACT DEPLOYED ===');
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${NETWORK_ID}`);

  fs.writeFileSync('deployment.json', JSON.stringify({
    contractAddress, network: NETWORK_ID,
    deployedAt: new Date().toISOString(), deployer: walletData.address,
  }, null, 2));
  console.log('Saved to deployment.json');
  await wallet.stop();
  process.exit(0);
}

function deriveKeysFromSeed(seed) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

function signTransactionIntents(tx, signFn, proofMarker) {
  if (!tx.intents || tx.intents.size === 0) return;
  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;
    const cloned = ledger.Intent.deserialize('signature', proofMarker, 'pre-binding', intent.serialize());
    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);
    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map((_, i) => cloned.fallibleUnshieldedOffer.signatures.at(i) ?? signature);
      cloned.fallibleUnshieldedOffer = cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }
    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map((_, i) => cloned.guaranteedUnshieldedOffer.signatures.at(i) ?? signature);
      cloned.guaranteedUnshieldedOffer = cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }
    tx.intents.set(segment, cloned);
  }
}

async function createWalletAndMidnightProvider(ctx) {
  const state = await Rx.firstValueFrom(ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  return {
    getCoinPublicKey() { return state.shielded.coinPublicKey.toHexString(); },
    getEncryptionPublicKey() { return state.shielded.encryptionPublicKey.toHexString(); },
    async balanceTx(tx, ttl) {
      const recipe = await ctx.wallet.balanceUnboundTransaction(tx,
        { shieldedSecretKeys: ctx.shieldedSecretKeys, dustSecretKey: ctx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signFn = (payload) => ctx.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, 'proof');
      if (recipe.balancingTransaction) signTransactionIntents(recipe.balancingTransaction, signFn, 'pre-proof');
      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx) { return ctx.wallet.submitTransaction(tx); },
  };
}

deploy().catch((err) => {
  console.error('DEPLOY FAILED:', err.message || err);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
