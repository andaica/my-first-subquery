import {
  Collection,
  createCollectionDatasource,
  ERC6551Account,
} from "../types";
import {
  CollectionCreatedLog,
  ERC6551AccountCreatedLog,
} from "../types/abi-interfaces/FactoryAbi";
import assert from "assert";
import { CHAIN_LIST, getNFT } from "./utils";

export async function handleCollectionCreatedAvaxTestnet(
  log: CollectionCreatedLog
) {
  await handleCollectionCreatedForChain(CHAIN_LIST.AVAX_TESTNET, log);
}

export async function handleCollectionCreatedBnbTestnet(
  log: CollectionCreatedLog
) {
  await handleCollectionCreatedForChain(CHAIN_LIST.BNB_TESTNET, log);
}

export async function handleCollectionCreatedDERATestnet(
  log: CollectionCreatedLog
) {
  await handleCollectionCreatedForChain(CHAIN_LIST.DERA_TESTNET, log);
}

export async function handleCollectionCreatedForChain(
  chainId: number,
  log: CollectionCreatedLog
): Promise<void> {
  logger.info(`CollectionCreatedLog at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const collectionAddr = log.args.collection.toLowerCase();

  const item = Collection.create({
    id: collectionAddr,
    chainId,
    blockHeight: BigInt(log.blockNumber),
    timestamp: log.block.timestamp,
    address: collectionAddr,
    owner: log.args.owner.toLowerCase(),
    kind: log.args.kind,
  });

  await item.save();

  await createCollectionDatasource({
    address: log.args.collection,
  });
}

export async function handleERC6551AccountCreatedAvaxTestnet(
  log: ERC6551AccountCreatedLog
) {
  await handleERC6551AccountCreated(CHAIN_LIST.AVAX_TESTNET, log);
}

export async function handleERC6551AccountCreatedBnbTestnet(
  log: ERC6551AccountCreatedLog
) {
  await handleERC6551AccountCreated(CHAIN_LIST.BNB_TESTNET, log);
}

export async function handleERC6551AccountCreatedDERATestnet(
  log: ERC6551AccountCreatedLog
) {
  await handleERC6551AccountCreated(CHAIN_LIST.DERA_TESTNET, log);
}

export async function handleERC6551AccountCreated(
  chainId: number,
  log: ERC6551AccountCreatedLog
): Promise<void> {
  logger.info(`ERC6551AccountCreatedLog at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const addr = log.args.account.toLowerCase();
  const underlyingNFT = await getNFT(
    chainId,
    log.args.tokenContract,
    log.args.tokenId.toBigInt()
  );

  const item = ERC6551Account.create({
    id: addr,
    chainId,
    blockHeight: BigInt(log.blockNumber),
    timestamp: log.block.timestamp,
    account: addr,
    implementation: log.args.implementation,
    salt: log.args.salt,
    underlyingNFTId: underlyingNFT.id,
  });

  await item.save();
}
