import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import { TERC20 } from "../../../generated/schema";
import { Transfer, ContractURIChanged } from "../../../generated/templates/TERC20/TERC20";
import { getTERC20 } from "../../entities/tokens/TERC20";
import { getWallet } from "../../entities/Wallet";
import { getWalletTERC20 } from "../../entities/WalletTERC20";

function handleMint(to: Address, terc20: TERC20, value: BigInt): void {
  const toWallet = getWallet(to);
  const walletERC20 = getWalletTERC20(to, terc20.id);

  walletERC20.balance = walletERC20.balance.plus(value);
  terc20.totalSupply = terc20.totalSupply.plus(value);

  terc20.save();
  toWallet.save();
  walletERC20.save();
}

function handleBurn(from: Address, terc20: TERC20, value: BigInt): void {
  const fromWallet = getWallet(from);
  const walletERC20 = getWalletTERC20(from, terc20.id);

  walletERC20.balance = walletERC20.balance.minus(value);
  terc20.totalSupply = terc20.totalSupply.minus(value);

  if (walletERC20.balance.equals(BigInt.zero())) {
    store.remove("WalletTERC20", walletERC20.id);
  } else {
    walletERC20.save();
  }

  terc20.save();
  fromWallet.save();
}

function handleTransfer(from: Address, to: Address, terc20: TERC20, value: BigInt): void {
  const toWallet = getWallet(to);

  const fromWalletERC20 = getWalletTERC20(from, terc20.id);
  const toWalletERC20 = getWalletTERC20(to, terc20.id);

  fromWalletERC20.balance = fromWalletERC20.balance.minus(value);
  toWalletERC20.balance = toWalletERC20.balance.plus(value);

  if (fromWalletERC20.balance.equals(BigInt.zero())) {
    store.remove("WalletTERC20", fromWalletERC20.id);
  } else {
    fromWalletERC20.save();
  }

  toWallet.save();
  toWalletERC20.save();
}

export function onTransfer(event: Transfer): void {
  const terc20 = getTERC20(event.address);
  const params = event.params;

  if (params.from == Address.zero()) {
    handleMint(params.to, terc20, params.value);
    return;
  }

  if (params.to == Address.zero()) {
    handleBurn(params.from, terc20, params.value);
    return;
  }

  handleTransfer(params.from, params.to, terc20, params.value);
}

export function onContractURIChanged(event: ContractURIChanged): void {
  const terc20 = getTERC20(event.address);
  terc20.contractURI = event.params.contractURI;
  terc20.save();
}
