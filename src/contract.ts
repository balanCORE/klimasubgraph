import { BigInt } from "@graphprotocol/graph-ts";
import { Contract, Transfer as TransferEvent } from "../generated/undefined/Contract";
import { User, Transfer } from "../generated/schema";

export function handleTransfer(event: TransferEvent): void {
  let user = User.load(event.params.from.toHexString());
  const MAX_SAFE_INT = 9007199254740991;
  const unixTimestamp = event.block.timestamp.toI64();
  const timestamp = unixTimestamp * 1000;

  if (user == null) {
    user = new User(event.params.from.toString());
    user.totalTransfers = BigInt.fromI32(0);
    user.totalAmount = BigInt.fromI32(0);
  }
  if (timestamp < MAX_SAFE_INT) {
    let contract = Contract.bind(event.address)
    const date = (new Date(timestamp)).toISOString().split('T')[0]  // 'YYYY-MM-DD'  
    let transfer = Transfer.load(date);
    if (transfer == null) {
      transfer = new Transfer(date);
      transfer.volume = BigInt.fromI32(0);
    }
    transfer.volume = transfer.volume.plus(event.params.value);
    transfer.totalSupply = contract.totalSupply();
    transfer.save();
  }

  user.totalTransfers = user.totalTransfers.plus(BigInt.fromI32(1));
  user.totalAmount = user.totalAmount.plus(event.params.value);

  user.save();
}