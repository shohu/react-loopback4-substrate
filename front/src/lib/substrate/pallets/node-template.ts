// import { KeyringPair } from '@polkadot/keyring/types';
import { Signer } from '@polkadot/api/types';

import { generateSignedTx } from '../txwrapper/sign';
import * as methods from '../txwrapper/methods';


export async function getDoSomethingTx(
    address: string,
    signer: Signer,
    value: string | number,
): Promise<string> {
    return await generateSignedTx(
        address,
        signer,
        methods.nodeTemplate.doSomething,
        { something: value },
    );
}
