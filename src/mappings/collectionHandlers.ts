import { NFT } from "../types";
import { TransferLog } from "../types/abi-interfaces/Erc721Abi";
import assert from "assert";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export async function getNFT(
  collection: string,
  tokenId: bigint
): Promise<NFT> {
  let nft = await NFT.get(`${collection.toLowerCase()}-${tokenId.toString()}`);

  if (!nft) {
    nft = NFT.create({
      id: `${collection.toLowerCase()}-${tokenId.toString()}`,
      collection: collection.toLowerCase(),
      tokenId: BigInt(tokenId),
    });
    // await nft.save();
  }

  return nft;
}

export async function handleTransfer(log: TransferLog): Promise<void> {
  logger.info(`New Transfer log at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const nft = await getNFT(log.address, log.args.tokenId.toBigInt());
  nft.owner = log.args.to.toLowerCase();

  if (log.args.from == ADDRESS_ZERO) {
    logger.info(
      `NFT ${log.args.tokenId} is minted on collection ${log.address}`
    );
    nft.blockHeight = BigInt(log.blockNumber);
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
