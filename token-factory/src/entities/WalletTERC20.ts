import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { WalletTERC20 } from "../../generated/schema";

export function getWalletTERC20(wallet: Bytes, terc20: Bytes): WalletTERC20 {
  let id = terc20.toHexString() + wallet.toHexString();
  let entity = WalletTERC20.load(id);

  if (entity == null) {
    entity = new WalletTERC20(id);
    entity.usersWallet = wallet;
    entity.token = terc20;
    entity.balance = BigInt.zero();
  }

  return entity;
}
