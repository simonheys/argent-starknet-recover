import fs from "fs-extra";
import path from "path";

/**
 * Script for updated the known tokens
 *
 * Takes the output from tokens API, filters for 'listed' tokens and writes to listed-tokens.json
 */

interface Token {
  id: number;
  address: string;
  name: string;
  tradable: boolean;
  symbol: string;
  decimals: number;
  sendable: boolean;
  category: string;
  refundable: boolean;
  popular: boolean;
  listed: boolean;
}

const network = "mainnet-alpha";
const inputTokensPath = path.resolve(__dirname, "../tokens.json");
const outputTokensPath = path.resolve(__dirname, "../listed-tokens.json");

async function makeListedTokens() {
  console.log(`Reading all tokens from ${inputTokensPath}`);
  const tokensRaw = await fs.readFile(inputTokensPath, "utf-8");
  const tokens = JSON.parse(tokensRaw) as Token[];
  const listedTokens = tokens.flatMap((token) => {
    if (!token.listed) {
      return [];
    }
    const { address, name, symbol, decimals } = token;
    return {
      network,
      address,
      name,
      symbol,
      decimals: `${decimals}`,
    };
  });
  console.log(`Writing listed tokens to ${outputTokensPath}`);
  await fs.writeFile(
    outputTokensPath,
    JSON.stringify(listedTokens, null, 2),
    "utf-8"
  );
}

(async () => {
  await makeListedTokens();
})();
