import {
  EthereumProject,
  EthereumDatasourceKind,
  EthereumHandlerKind,
} from "@subql/types-ethereum";

import * as dotenv from "dotenv";
import path from "path";

const mode = process.env.NODE_ENV || "production";

// Load the appropriate .env file
const dotenvPath = path.resolve(
  process.cwd(),
  `.env${mode !== "production" ? `.${mode}` : ""}`
);
dotenv.config({ path: dotenvPath });

// Can expand the Datasource processor types via the generic param
const project: EthereumProject = {
  specVersion: "1.0.0",
  version: "0.0.1",
  name: "bsc-mobox-rewards",
  description:
    "This project can be use as a starting point for developing your new BSC Testnet SubQuery project",
  runner: {
    node: {
      name: "@subql/node-ethereum",
      version: ">=3.0.0",
    },
    query: {
      name: "@subql/query",
      version: "*",
    },
  },
  schema: {
    file: "./schema.graphql",
  },
  network: {
    /**
     * chainId is the EVM Chain ID, for BSC this is 56
     * https://chainlist.org/chain/56
     */
    chainId: process.env.CHAIN_ID!,
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: process.env.ENDPOINT!?.split(",") as string[] | string,
  },
  dataSources: [
    {
      kind: EthereumDatasourceKind.Runtime,
      startBlock: parseInt(process.env.PROTOCOL_START_BLOCK!),
      options: {
        abi: "FactoryAbi",
        address: process.env.PROTOCOL_FACTORY_ADDRESS,
      },
      assets: new Map([["FactoryAbi", { file: "./abis/factory.abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleCollectionCreated",
            filter: {
              topics: [
                "CollectionCreated(address owner, address collection, uint8 kind)",
              ],
            },
          },
        ],
      },
    },
  ],
  templates: [
    {
      name: "Collection",
      kind: EthereumDatasourceKind.Runtime,

      options: {
        // Must be a key of assets
        abi: "erc721",
      },
      assets: new Map([["erc721", { file: "./abis/erc721.abi.json" }]]),
      mapping: {
        file: "./dist/index.js",
        handlers: [
          {
            kind: EthereumHandlerKind.Event,
            handler: "handleTransfer",
            filter: {
              topics: ["Transfer(address from, address to, uint256 tokenId)"],
            },
          },
        ],
      },
    },
  ],
  // repository: "https://github.com/subquery/ethereum-subql-starter",
};

// Must set default to the project instance
export default project;
