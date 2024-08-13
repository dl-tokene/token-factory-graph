import { Address } from "@graphprotocol/graph-ts";
import { Wallet } from "../../generated/schema";

export function getWallet(id: Address): Wallet {
  let entity = Wallet.load(id);

  if (entity == null) {
    entity = new Wallet(id);
  }

  return entity;
}
