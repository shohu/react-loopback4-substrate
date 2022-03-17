import { ApiPromise, WsProvider } from '@polkadot/api';
import { assert, stringify } from '@polkadot/util';
import { EventRecord } from '@polkadot/types/interfaces/system';
import { UnsignedTransaction } from '@substrate/txwrapper-core';
import { FALLBACK_MAX_HASH_COUNT, FALLBACK_PERIOD, MAX_FINALITY_LAG, MORTAL_PERIOD } from './constants';

import types from './types';


class SubstrateSingleton {
  private static instance: SubstrateSingleton;
  private constructor() {}
  public api: ApiPromise;

  static getInstance = async () => {
    if (!SubstrateSingleton.instance) {
      console.log('Create substrate instance ....');
      SubstrateSingleton.instance = new SubstrateSingleton();
      const provider = new WsProvider(process.env.PROVIDER_SOCKET);
      SubstrateSingleton.instance.api = await ApiPromise.create({
        provider,
        types: {
          ...types,
          // chain-specific overrides
          Keys: 'SessionKeys4'
        }
      });
    }
    return SubstrateSingleton.instance;
  }

  submit = async (
    signedTx: string | undefined,
  ): Promise<EventRecord[] | boolean> => {
    assert(signedTx, `Tx parameter is required !`);
    let isFinish = false;
    let isError = false;
    let occuredEvents: EventRecord[] = [];  
    const unsub = await this.api.rpc.author.submitAndWatchExtrinsic(
      this.api.createType('Extrinsic', signedTx),
      (result: any) => {
        // console.log(stringify(result.toHuman(), 2));
        if (result.isInBlock) {
          console.log(`Transaction included at blockHash ${result.hash.toHex()}`);
        } else if (result.isFinalized) {
          console.log(`Transaction finalized`);
          occuredEvents = result.events;
          isFinish = true;
          unsub();
        } else if (result.isError) {
          console.error(`Transaction finalized`);
          isFinish = true;
          isError = true;
          unsub();
        }
    });
    // HACK: 本番運用とかで、ロックとか何か不整合が発生しそうだが、、、サンプルだから、、、
    while (!isFinish) {
      await new Promise(resolve => setTimeout(resolve, 1000));  // sleep 1 sec
    }
    if(isError) return false;
    return occuredEvents;
  }

  getSomethingNumber = async (): Promise<Number> => {
    let something = await this.api.query.templateModule.something();
    return Number(something.toJSON());
  }

  // ブラウザ側の署名に必要なデータを返却する
  getChainInfoForClient = async (): Promise<any> => {
    const { block } = await this.api.rpc.chain.getBlock();
    const blockHash = await this.api.rpc.chain.getBlockHash();
    const genesisHash = await this.api.rpc.chain.getBlockHash(0);
    const metadataRpc = await this.api.rpc.state.getMetadata();
    const runtimeVersion = await this.api.rpc.state.getRuntimeVersion();
    let a = this.api.consts.system;
    const mortalLength = Math.min(
      this.api.consts.system?.blockHashCount?.toNumber() || FALLBACK_MAX_HASH_COUNT,
      MORTAL_PERIOD
        .div(this.api.consts.babe?.expectedBlockTime || this.api.consts.timestamp?.minimumPeriod.muln(2) || FALLBACK_PERIOD)
        .iadd(MAX_FINALITY_LAG)
        .toNumber()
    )
    return {
        block,
        blockHash,
        genesisHash,
        metadataRpc,
        runtimeVersion,
        mortalLength,
    }
  }

  getNonce = async (address: string): Promise<Number> => {
    const nonce = await this.api.rpc.system.accountNextIndex(address);
    return nonce.toNumber();
  }

}

export {
  SubstrateSingleton
}