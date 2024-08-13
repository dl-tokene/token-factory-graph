import { Address, BigInt, store } from "@graphprotocol/graph-ts";
import { TERC721 } from "../../../generated/schema";
import { Transfer, ContractURIChanged } from "../../../generated/templates/TERC721/TERC721";
import { getTERC721 } from "../../entities/tokens/TERC721";
import { getWalletTERC721 } from "../../entities/WalletTERC721";
import { getWallet } from "../../entities/Wallet";
import { extendArray, reduceArray } from "../../helpers/ArrayHelper";

function removeNFT(from: Address, terc721: TERC721, tokenId: BigInt): void {
  const fromWallet = getWallet(from);
  const walletTERC721 = getWalletTERC721(from, terc721.id);

  walletTERC721.nftIds = reduceArray(walletTERC721.nftIds, [tokenId]);
  if (walletTERC721.nftIds.length == 0) {
    store.remove("WalletTERC721", walletTERC721.id);
  } else {
    walletTERC721.save();
  }

  fromWallet.save();
}

function addNFT(to: Address, terc721: TERC721, tokenId: BigInt): void {
  const toWallet = getWallet(to);
  const walletTERC721 = getWalletTERC721(to, terc721.id);

  walletTERC721.nftIds = extendArray(walletTERC721.nftIds, [tokenId]);

  walletTERC721.save();
  toWallet.save();
}

function handleMint(to: Address, terc721: TERC721, tokenId: BigInt): void {
  addNFT(to, terc721, tokenId);

  terc721.totalSupply = terc721.totalSupply.plus(BigInt.fromI32(1));
  terc721.save();
}

function handleBurn(from: Address, terc721: TERC721, tokenId: BigInt): void {
  removeNFT(from, terc721, tokenId);

  terc721.totalSupply = terc721.totalSupply.minus(BigInt.fromI32(1));
  terc721.save();
}

function handleTransfer(from: Address, to: Address, terc721: TERC721, tokenId: BigInt): void {
  removeNFT(from, terc721, tokenId);
  addNFT(to, terc721, tokenId);
}

export function onTransfer(event: Transfer): void {
  const terc721 = getTERC721(event.address);
  const params = event.params;
  if (params.from == Address.zero()) {
    handleMint(params.to, terc721, params.tokenId);
    return;
  }

  if (params.to == Address.zero()) {
    handleBurn(params.from, terc721, params.tokenId);
    return;
  }

  handleTransfer(params.from, params.to, terc721, params.tokenId);
}

export function onContractURIChanged(event: ContractURIChanged): void {
  const terc721 = getTERC721(event.address);
  terc721.contractURI = event.params.contractURI;
  terc721.save();
}
