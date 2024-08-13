import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, newMockEvent, test } from "matchstick-as";
import { Transfer, ContractURIChanged } from "../generated/templates/TERC721/TERC721";
import { getBlock, getTransaction } from "./utils/utils";
import { onTransfer, onContractURIChanged } from "../src/mappings/tokens/TERC721";

function createTransfer(
  tokenContract: Address,
  from: Address,
  to: Address,
  tokenId: BigInt,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Transfer {
  let event = changetype<Transfer>(newMockEvent());

  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));

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
  Address.fromString("0xBf6A07c76E48b1D3788c646eA495fe431eDb9e86"),
  Address.fromString("0x1957b428C7902b7f2720F0498a2068619F653A85"),
];

const zeroAddress = Address.zero();
const wallets = [
  Address.fromString("0x0000000000000000000000000000000000000001"),
  Address.fromString("0x0000000000000000000000000000000000000002"),
];

describe("TokenFactory", () => {
  test("should handle TERC721 Transfer event. Mint", () => {
    let event = createTransfer(tokens[0], zeroAddress, wallets[0], BigInt.fromI32(1), block, tx);

    onTransfer(event);

    assertWallet(wallets[0], [tokens[0]], [["1"]]);
    assertTERC721(tokens[0], BigInt.fromI32(1));

    event = createTransfer(tokens[0], zeroAddress, wallets[0], BigInt.fromI32(2), block, tx);

    onTransfer(event);

    assertWallet(wallets[0], [tokens[0]], [["1", "2"]]);
    assertTERC721(tokens[0], BigInt.fromI32(2));

    event = createTransfer(tokens[1], zeroAddress, wallets[1], BigInt.fromI32(1), block, tx);

    onTransfer(event);

    assertWallet(wallets[1], [tokens[1]], [["1"]]);
    assertTERC721(tokens[1], BigInt.fromI32(1));
  });

  test("should handle TERC721 Transfer event. Burn", () => {
    let event = createTransfer(tokens[0], wallets[0], zeroAddress, BigInt.fromI32(2), block, tx);

    onTransfer(event);

    assertWallet(wallets[0], [tokens[0]], [["1"]]);
    assertTERC721(tokens[0], BigInt.fromI32(1));
  });

  test("should handle TERC721 Transfer event", () => {
    let event = createTransfer(tokens[0], wallets[0], wallets[1], BigInt.fromI32(1), block, tx);

    onTransfer(event);

    assertWallet(wallets[0], [], []);
    assert.notInStore("WalletTERC721", tokens[0].toHexString() + wallets[0].toHexString());
    assertWallet(wallets[1], [tokens[1], tokens[0]], [["1"], ["1"]]);

    event = createTransfer(tokens[0], wallets[1], zeroAddress, BigInt.fromI32(1), block, tx);

    onTransfer(event);

    assertWallet(wallets[1], [tokens[1]], [["1"]]);
    assertTERC721(tokens[0], BigInt.zero());
    assert.notInStore("WalletTERC721", tokens[0].toHexString() + wallets[1].toHexString());
  });

  test("should handle TERC721 ContractURIChanged event", () => {
    const newContractURI = "new contractURI";
    const event = createContractURIChanged(tokens[0], newContractURI);

    onContractURIChanged(event);

    assert.fieldEquals("TERC721", tokens[0].toHexString(), "id", tokens[0].toHexString());
    assert.fieldEquals("TERC721", tokens[0].toHexString(), "contractURI", newContractURI);
  });
});

function assertWallet(wallet: Address, terc721: Array<Address>, ids: Array<Array<string>>): void {
  assert.fieldEquals("Wallet", wallet.toHexString(), "id", wallet.toHexString());

  for (let i = 0; i < terc721.length; i++) {
    assertUserNFT(wallet, terc721[i], ids[i]);
  }
}

function assertUserNFT(wallet: Address, terc721: Address, ids: Array<string>): void {
  const id = terc721.toHexString() + wallet.toHexString();
  assert.fieldEquals("WalletTERC721", id, "id", id);
  assert.fieldEquals("WalletTERC721", id, "token", terc721.toHexString());
  assert.fieldEquals("WalletTERC721", id, "usersWallet", wallet.toHexString());
  assert.fieldEquals("WalletTERC721", id, "nftIds", "[" + ids.join(", ") + "]");
}

function assertTERC721(token: Address, totalSupply: BigInt): void {
  assert.fieldEquals("TERC721", token.toHexString(), "id", token.toHexString());
  assert.fieldEquals("TERC721", token.toHexString(), "totalSupply", totalSupply.toString());
}
