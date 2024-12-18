import { TransferLog } from "../types/abi-interfaces/Erc721Abi";
import assert from "assert";
import { ADDRESS_ZERO, CHAIN_LIST, getNFT } from "./utils";

export async function handleTransferAvaxTestnet(log: TransferLog) {
  await handleTransferForChain(CHAIN_LIST.AVAX_TESTNET, log);
}

export async function handleTransferBnbTestnet(log: TransferLog) {
  await handleTransferForChain(CHAIN_LIST.BNB_TESTNET, log);
}

export async function handleTransferDERATestnet(log: TransferLog) {
  await handleTransferForChain(CHAIN_LIST.DERA_TESTNET, log);
}

export async function handleTransferForChain(
  chainId: number,
  log: TransferLog
): Promise<void> {
  logger.info(`New Transfer log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const nft = await getNFT(
    chainId,
    log.address,
    log.args.tokenId.toBigInt(),
    true
  );
  nft.owner = log.args.to.toLowerCase();

  if (log.args.from == ADDRESS_ZERO) {
    logger.info(
      `NFT ${log.args.tokenId} is minted on collection ${log.address}`
    );
    nft.blockHeight = BigInt(log.blockNumber);
    nft.timestamp = BigInt(log.block.timestamp);
  } else if (log.args.to == ADDRESS_ZERO) {
    logger.info(
      `NFT ${log.args.tokenId} is burned from collection ${log.address}`
    );
    nft.isBurned = true;
  }

  logger.info(
    `NFT ${log.args.tokenId} is transfered on collection ${log.address}`
  );

  return await nft.save();
}
