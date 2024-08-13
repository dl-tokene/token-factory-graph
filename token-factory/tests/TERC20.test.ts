import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, newMockEvent, test } from "matchstick-as";
import { ContractURIChanged, Transfer } from "../generated/templates/TERC20/TERC20";
import { getBlock, getTransaction } from "./utils/utils";
import { onContractURIChanged, onTransfer } from "../src/mappings/tokens/TERC20";

function createTransfer(
  tokenContract: Address,
  from: Address,
  to: Address,
  value: BigInt,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Transfer {
  let event = changetype<Transfer>(newMockEvent());

  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value)));

  event.transaction = tx;
  event.block = block;
  event.address = tokenContract;

  return event;
}

function createContractURIChanged(tokenContract: Address, contractURI: string): ContractURIChanged {
  let event = changetype<ContractURIChanged>(newMockEvent());

  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("contractURI", ethereum.Value.fromString(contractURI)));

  event.transaction = tx;
  event.block = block;
  event.address = tokenContract;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));
const tokens = [
  Address.fromString("0xb4Ff848014fB7eE928B42F8280f5EED1A24c0E0E"),
  Address.fromString("0x29F051c776ECC47F0747FEA8C131a11d90Acae29"),
];

const zeroAddress = Address.zero();
const wallets = [
  Address.fromString("0x0000000000000000000000000000000000000001"),
  Address.fromString("0x0000000000000000000000000000000000000002"),
];

describe("TokenFactory", () => {
  test("should handle TERC20 Transfer event. Mint", () => {
    let totalSupply = 0;
    let value = 10;
    let event = createTransfer(tokens[0], zeroAddress, wallets[0], BigInt.fromI32(value), block, tx);

    onTransfer(event);
    totalSupply += value;

    assertWallet(wallets[0], [tokens[0].toHexString()], [value.toString()]);
    assertTERC20(tokens[0], BigInt.fromI32(totalSupply));

    onTransfer(event);
    totalSupply += value;

    assertWallet(wallets[0], [tokens[0].toHexString()], [BigInt.fromI32(2 * value).toString()]);
    assertTERC20(tokens[0], BigInt.fromI32(totalSupply));

    event = createTransfer(tokens[1], zeroAddress, wallets[1], BigInt.fromI32(5), block, tx);

    onTransfer(event);

    assertWallet(wallets[1], [tokens[1].toHexString()], ["5"]);
    assertTERC20(tokens[1], BigInt.fromI32(5));
  });

  test("should handle TERC20 Transfer event. Burn", () => {
    let totalSupply = 20;
    let value = 10;
    let event = createTransfer(tokens[0], wallets[0], zeroAddress, BigInt.fromI32(value), block, tx);

    onTransfer(event);
    totalSupply -= value;

    assertWallet(wallets[0], [tokens[0].toHexString()], [value.toString()]);
    assertTERC20(tokens[0], BigInt.fromI32(totalSupply));
  });

  test("should handle TERC20 Transfer event", () => {
    let value = 10;
    let event = createTransfer(tokens[0], wallets[0], wallets[1], BigInt.fromI32(value), block, tx);

    onTransfer(event);

    assertWallet(wallets[0], [], []);
    assertWallet(wallets[1], [tokens[1].toHexString(), tokens[0].toHexString()], ["5", value.toString()]);
    assert.notInStore("WalletTERC20", tokens[0].toHexString() + wallets[0].toHexString());

    event = createTransfer(tokens[1], wallets[1], zeroAddress, BigInt.fromI32(5), block, tx);

    onTransfer(event);

    assertWallet(wallets[1], [tokens[0].toHexString()], [value.toString()]);
    assertTERC20(tokens[1], BigInt.zero());
    assert.notInStore("WalletTERC20", tokens[1].toHexString() + wallets[1].toHexString());
  });

  test("should handle TERC20 ContractURIChanged event", () => {
    const newContractURI = "new contractURI";
    const event = createContractURIChanged(tokens[0], newContractURI);

    onContractURIChanged(event);

    assert.fieldEquals("TERC20", tokens[0].toHexString(), "id", tokens[0].toHexString());
    assert.fieldEquals("TERC20", tokens[0].toHexString(), "contractURI", newContractURI);
  });
});

function assertWallet(wallet: Address, terc20: Array<string>, values: Array<string>): void {
  assert.fieldEquals("Wallet", wallet.toHexString(), "id", wallet.toHexString());

  for (let i = 0; i < terc20.length; i++) {
    const id = terc20[i] + wallet.toHexString();
    assert.fieldEquals("WalletTERC20", id, "id", id);
    assert.fieldEquals("WalletTERC20", id, "token", terc20[i]);
    assert.fieldEquals("WalletTERC20", id, "usersWallet", wallet.toHexString());
    assert.fieldEquals("WalletTERC20", id, "balance", values[i]);
  }
}

function assertTERC20(token: Address, totalSupply: BigInt): void {
  assert.fieldEquals("TERC20", token.toHexString(), "id", token.toHexString());
  assert.fieldEquals("TERC20", token.toHexString(), "totalSupply", totalSupply.toString());
}
