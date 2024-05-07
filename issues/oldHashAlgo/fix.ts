import { BigNumber } from "ethers";
import ora from "ora";
import { Provider } from "starknet-390/dist/provider";
import { Account as SNAccount } from "starknet-390/dist/account";
import { getKeyPair, getStarkKey } from "starknet-390/dist/utils/ellipticCurve";
import {
  compileCalldata,
  estimatedFeeToMaxFee,
} from "starknet-390/dist/utils/stark";
import { oraLog } from "../../oraLog";
import { Account } from "../../ui/pickAccounts";
import { NetworkId } from "../../types";

const LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS =
  "0x01bd7ca87f139693e6681be2042194cf631c4e8d77027bf0ea9e6d55fc6018ac"; // KEEP

export const fix = async (
  accounts: Account[],
  networkId: NetworkId,
  accountsToFix: string[]
): Promise<void> => {
  const spinner = ora(
    `Fixing oldHashAlgo issue (this may take some time)`
  ).start();
  for (const a of accounts) {
    if (accountsToFix.includes(a.address)) {
      const privateKey = a.privateKey;
      if (!privateKey) {
        throw new Error("No private key for account to credit");
      }
      const keyPair = getKeyPair(privateKey);
      const starkKey = getStarkKey(keyPair);
      if (!BigNumber.from(a.signer).eq(starkKey)) {
        throw new Error(
          "Account cant be controlled with the selected private key or seed"
        );
      }
      const legacyNetworkId =
        networkId === "sepolia-alpha" ? "goerli-alpha" : networkId;
      const provider = new Provider({ network: legacyNetworkId });
      const account = new SNAccount(provider, a.address.toLowerCase(), keyPair);

      const call = {
        contractAddress: a.address,
        entrypoint: "upgrade",
        calldata: compileCalldata({
          implementation: LATEST_ACCOUNT_IMPLEMENTATION_ADDRESS,
        }),
      };

      const x: any = await account.estimateFee(call); // overwrite type as API has changed
      const transaction = await account.execute(call, undefined, {
        maxFee: estimatedFeeToMaxFee(x.overall_fee, 2), // 200% overhead (300% in total) as maxFee, as the provider estimate does not account for the costs added by the account abstraction
      });
      oraLog(spinner, `Transaction ${transaction.transaction_hash} created`);
      await provider.waitForTransaction(transaction.transaction_hash);

      // wait 1 minute extra to make sure the transaction is mined
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  }
  spinner.succeed(`Fixed oldHashAlgo issue`);
};
