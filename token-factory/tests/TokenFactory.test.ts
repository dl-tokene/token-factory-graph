import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, newMockEvent, test } from "matchstick-as";
import { DeployedTERC20, DeployedTERC721 } from "../generated/TokenFactory/TokenFactory";
import { getBlock, getTransaction } from "./utils/utils";
import { onDeployedTERC20, onDeployedTERC721 } from "../src/mappings/TokenFactory";

function createDeployedTERC20Event(
  address: Address,
  name: string,
  symbol: string,
  decimals: BigInt,
  contractURI: string,
  totalSupplyCap: BigInt,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DeployedTERC20 {
  const event = changetype<DeployedTERC20>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(address)));

  const param1 = new ethereum.Tuple(5);
  param1[0] = ethereum.Value.fromString(name);
  param1[1] = ethereum.Value.fromString(symbol);
  param1[2] = ethereum.Value.fromString(contractURI);
  param1[3] = ethereum.Value.fromSignedBigInt(decimals);
  param1[4] = ethereum.Value.fromSignedBigInt(totalSupplyCap);

  event.parameters.push(new ethereum.EventParam("param1", ethereum.Value.fromTuple(param1)));

  event.block = block;
  event.transaction = tx;

  return event;
}

function createDeployedTERC721Event(
  address: Address,
  name: string,
  symbol: string,
  basURI: string,
  contractURI: string,
  totalSupplyCap: BigInt,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DeployedTERC721 {
  let event = changetype<DeployedTERC721>(newMockEvent());
  event.parameters = new Array();
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(address)));

  const param1 = new ethereum.Tuple(5);

  param1[0] = ethereum.Value.fromString(name);
  param1[1] = ethereum.Value.fromString(symbol);
  param1[2] = ethereum.Value.fromString(contractURI);
  param1[3] = ethereum.Value.fromString(basURI);
  param1[4] = ethereum.Value.fromSignedBigInt(totalSupplyCap);

  event.parameters.push(new ethereum.EventParam("param1", ethereum.Value.fromTuple(param1)));

  event.block = block;
  event.transaction = tx;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

describe("TokenFactory", () => {
  test("should handle DeployedTERC20 event", () => {
    let token = Address.fromString("0xb4Ff848014fB7eE928B42F8280f5EED1A24c0E0E");
    const name = "TERC20";
    const symbol = "T20";
    const decimals = BigInt.fromI32(1);
    const contractURI = "contractURI";
    const totalSupplyCap = BigInt.fromI64(100000000);
    const totalSupply = BigInt.zero();

    let event = createDeployedTERC20Event(token, name, symbol, decimals, contractURI, totalSupplyCap, block, tx);

    onDeployedTERC20(event);

    assertTERC20(token, name, symbol, decimals, contractURI, totalSupplyCap, totalSupply);

    token = Address.fromString("0x29F051c776ECC47F0747FEA8C131a11d90Acae29");
    event = createDeployedTERC20Event(token, name, symbol, decimals, contractURI, totalSupplyCap, block, tx);

    onDeployedTERC20(event);

    assertTERC20(token, name, symbol, decimals, contractURI, totalSupplyCap, totalSupply);
  });

  test("should handle DeployedTERC721 event", () => {
    let token = Address.fromString("0xBf6A07c76E48b1D3788c646eA495fe431eDb9e86");
    const name = "ERC721";
    const symbol = "ERC";
    const baseURI = "baseURI";
    const contractURI = "contractURI";
    const totalSupplyCap = BigInt.fromI64(100000000);
    const totalSupply = BigInt.zero();

    let event = createDeployedTERC721Event(token, name, symbol, baseURI, contractURI, totalSupplyCap, block, tx);

    onDeployedTERC721(event);

    assertTERC721(token, name, symbol, baseURI, contractURI, totalSupplyCap, totalSupply);

    token = Address.fromString("0x1957b428C7902b7f2720F0498a2068619F653A85");
    event = createDeployedTERC721Event(token, name, symbol, baseURI, contractURI, totalSupplyCap, block, tx);

    onDeployedTERC721(event);

    assertTERC721(token, name, symbol, baseURI, contractURI, totalSupplyCap, totalSupply);
  });
});

function assertTERC20(
  token: Address,
  name: string,
  symbol: string,
  decimals: BigInt,
  contractURI: string,
  totalSupplyCap: BigInt,
  totalSupply: BigInt
): void {
  assert.fieldEquals("TERC20", token.toHexString(), "id", token.toHexString());
  assert.fieldEquals("TERC20", token.toHexString(), "name", name);
  assert.fieldEquals("TERC20", token.toHexString(), "symbol", symbol);
  assert.fieldEquals("TERC20", token.toHexString(), "decimals", decimals.toString());
  assert.fieldEquals("TERC20", token.toHexString(), "contractURI", contractURI);
  assert.fieldEquals("TERC20", token.toHexString(), "totalSupplyCap", totalSupplyCap.toString());
  assert.fieldEquals("TERC20", token.toHexString(), "totalSupply", totalSupply.toString());
}

function assertTERC721(
  token: Address,
  name: string,
  symbol: string,
  baseURI: string,
  contractURI: string,
  totalSupplyCap: BigInt,
  totalSupply: BigInt
): void {
  assert.fieldEquals("TERC721", token.toHexString(), "id", token.toHexString());
  assert.fieldEquals("TERC721", token.toHexString(), "name", name);
  assert.fieldEquals("TERC721", token.toHexString(), "symbol", symbol);
  assert.fieldEquals("TERC721", token.toHexString(), "baseURI", baseURI);
  assert.fieldEquals("TERC721", token.toHexString(), "contractURI", contractURI);
  assert.fieldEquals("TERC721", token.toHexString(), "totalSupplyCap", totalSupplyCap.toString());
  assert.fieldEquals("TERC721", token.toHexString(), "totalSupply", totalSupply.toString());
}
