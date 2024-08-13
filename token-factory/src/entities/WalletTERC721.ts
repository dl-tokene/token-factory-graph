import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { WalletTERC721 } from "../../generated/schema";

export function getWalletTERC721(wallet: Bytes, terc721: Bytes): WalletTERC721 {
  let id = terc721.toHexString() + wallet.toHexString();
  let entity = WalletTERC721.load(id);

  if (entity == null) {
    entity = new WalletTERC721(id);
    entity.usersWallet = wallet;
    entity.token = terc721;
    entity.nftIds = new Array<BigInt>();
  }

  return entity;
}
