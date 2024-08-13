import { BigInt } from "@graphprotocol/graph-ts";
import { TERC20, TERC721 } from "../../generated/templates";
import { DeployedTERC20, DeployedTERC721 } from "../../generated/TokenFactory/TokenFactory";
import { getTERC20 } from "../entities/tokens/TERC20";
import { getTERC721 } from "../entities/tokens/TERC721";

export function onDeployedTERC20(event: DeployedTERC20): void {
  const params = event.params.param1;
  getTERC20(
    event.params.token,
    params.name,
    params.symbol,
    BigInt.fromI32(params.decimals),
    params.contractURI,
    params.totalSupplyCap
  ).save();

  TERC20.create(event.params.token);
}

export function onDeployedTERC721(event: DeployedTERC721): void {
  const params = event.params.param1;
  getTERC721(
    event.params.token,
    params.name,
    params.symbol,
    params.baseURI,
    params.contractURI,
    params.totalSupplyCap
  ).save();

  TERC721.create(event.params.token);
}
