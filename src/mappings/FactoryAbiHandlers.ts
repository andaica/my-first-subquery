import { Collection, createCollectionDatasource } from "../types";
import { CollectionCreatedLog } from "../types/abi-interfaces/FactoryAbi";
import assert from "assert";

export async function handleCollectionCreated(
  log: CollectionCreatedLog
): Promise<void> {
  logger.info(`CollectionCreatedLog at block ${log.blockNumber}`);
  assert(log.args, "No log.args");

  const collectionAddr = log.args.collection.toLowerCase();

  const item = Collection.create({
    id: collectionAddr,
    blockHeight: BigInt(log.blockNumber),
    address: collectionAddr,
    owner: log.args.owner.toLowerCase(),
    kind: log.args.kind,
  });

  await item.save();

  await createCollectionDatasource({
    address: log.args.collection,
  });
}
