# Starknet Recovery CLI

This is a command line tool can be used to recover funds from old Starknet accounts.
After entering your seedphrase or private key it will scan for your accounts and potential funds and issues.
You can then choose to fix issues and recover your funds to a new account address.

## Usage

It is simplest to download the latest release from the [releases page](https://github.com/argentlabs/argent-starknet-recover/releases).
After downloading the binary matching your machine you can run it inside a terminal.

If you have `node`, `nvm` and `pnpm` installed you can also clone this repo and run the following:

```bash
$ nvm use
$ pnpm
$ pnpm start
```

**Use at your own risk**

## Debugging with VSCode

You can use the Run and Debug feature to debug with VSCode - good luck!

## Update tokens

Download current `tokens.json` from the token info API then run the script to filter listed tokens. These will be used to discover token balances.

```bash
$ pnpm gen:tokens
```
