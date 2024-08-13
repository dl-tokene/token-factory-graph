import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TERC20 } from "../../../generated/schema";

export function getTERC20(
  id: Address,
  name: string = "",
  symbol: string = "",
  decimals: BigInt = BigInt.zero(),
  contractURI: string = "",
  totalSupplyCap: BigInt = BigInt.zero()
): TERC20 {
  let entity = TERC20.load(id);

  if (entity == null) {
    entity = new TERC20(id);
    entity.name = name;
    entity.symbol = symbol;
    entity.decimals = decimals;
    entity.contractURI = contractURI;
    entity.totalSupplyCap = totalSupplyCap;
    entity.totalSupply = BigInt.zero();
  }

  return entity;
}
