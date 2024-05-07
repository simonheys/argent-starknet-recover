import { Account } from "./ui/pickAccounts";
import { TOKENS } from "./tokens";
import { omit } from "lodash";

export function display(accounts: Account[]) {
  console.table(
    accounts.map((a) => ({
      ...Object.fromEntries(
        Object.entries(a.balances).map(([token, balance]) => {
          const tokenInfo = TOKENS.find((t) => t.address === token);
          return [tokenInfo?.name ?? token, balance] as const;
        })
      ),
      ...omit(a, ["privateKey", "networkId", "balances"]),
    }))
  );
}
