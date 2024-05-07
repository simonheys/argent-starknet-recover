import { utils, Wallet } from "ethers";
import { Ora } from "ora";
import prompts from "prompts";
import {
  getAccountsByPrivateKey,
  getAccountsBySeedPhrase,
} from "../getAccounts";
import { hexValue, numberValue } from "../schema";
import { NetworkId } from "../types";

export const getAccountsAndNetwork = async (ora: Ora) => {
  const {
    seedOrPrivateKey,
    networkId,
  }: {
    seedOrPrivateKey: string;
    networkId: NetworkId;
  } = await prompts(
    [
      {
        type: "select",
        name: "networkId",
        message: "Choose network",
        choices: [
          { title: "SN Mainnet", value: "mainnet-alpha" },
          { title: "SN Testnet", value: "sepolia-alpha" },
        ],
      },
      {
        type: "select",
        name: "seedOrPrivateKey",
        message: "Do you want to recover by seed or by private key?",
        choices: [
          { title: "Seed", value: "seed" },
          { title: "Private Key", value: "privateKey" },
        ],
      },
    ],
    { onCancel: () => process.exit(1) }
  );

  if (seedOrPrivateKey === "seed") {
    const { seed }: { seed: string } = await prompts(
      {
        type: "text",
        name: "seed",
        message: "Enter your seed",
        mask: "*",
        validate: (value) => {
          try {
            utils.HDNode.fromMnemonic(value);
          } catch {
            return "Invalid seed";
          }
          return true;
        },
      },
      { onCancel: () => process.exit(1) }
    );

    ora.start("Discovering Accounts");
    const accounts = await getAccountsBySeedPhrase(seed, networkId);
    return {
      accounts,
      networkId,
      seed,
    };
  } else if (seedOrPrivateKey === "privateKey") {
    const { privateKey }: { privateKey: string } = await prompts(
      [
        {
          type: "text",
          name: "privateKey",
          message: "Enter your private key",
          mask: "*",
          validate: async (value) => {
            try {
              const settledPromises = await Promise.allSettled([
                hexValue.validate(value),
                numberValue.validate(value),
              ]);
              if (
                settledPromises.every(({ status }) => status === "rejected")
              ) {
                return "Please input hex or number";
              }
            } catch (e) {
              return "Invalid private key";
            }
            return true;
          },
        },
      ],
      { onCancel: () => process.exit(1) }
    );

    ora.start("Discovering Accounts");
    const accounts = await getAccountsByPrivateKey(privateKey, networkId);
    return { accounts, networkId, privateKey };
  } else {
    throw new Error("Invalid seedOrPrivateKey");
  }
};
