import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TERC721 } from "../../../generated/schema";

export function getTERC721(
  id: Address,
  name: string = "",
  symbol: string = "",
  baseURI: string = "",
  contractURI: string = "",
  totalSupplyCap: BigInt = BigInt.zero()
): TERC721 {
  let entity = TERC721.load(id);

  if (entity == null) {
    entity = new TERC721(id);
    entity.name = name;
    entity.symbol = symbol;
    entity.baseURI = baseURI;
    entity.contractURI = contractURI;
    entity.totalSupplyCap = totalSupplyCap;
    entity.totalSupply = BigInt.zero();
  }

  return entity;
}
