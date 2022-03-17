import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { TypeRegistry } from '@polkadot/types';
import type { SignatureOptions } from '@polkadot/types/types';
import type { Address, ExtrinsicEra, Hash, Header, Index, RuntimeVersion, SignerPayload } from '@polkadot/types/interfaces';
import { Signer, SignerResult } from '@polkadot/api/types';
import { isNumber, objectSpread } from '@polkadot/util';
import type { SignerOptions } from '@polkadot/api/submittable/types';

import { Args, BaseTxInfo, Options, OptionsWithMeta, UnsignedTransaction } from './types';
// import {
//     Args,
// 	BaseTxInfo,
//     Options,
// 	OptionsWithMeta,
// 	UnsignedTransaction,
//     createMetadata,
// } from '@substrate/txwrapper-core';

import { getChainInfo, getNonce } from '../../api/substrate';
import { createMetadata } from './metadata';
import { getRegistry } from './registry';
// import {
// 	getRegistry,
// } from '@substrate/txwrapper-registry';

// https://github.com/polkadot-js/api/blob/9f6f33844a636f44afc5dd3c66ba9355ab26bb0a/packages/api/src/submittable/createClass.ts
function makeEraOptions (
    registry: TypeRegistry,
    partialOptions: Partial<SignerOptions>,
    { header, mortalLength, nonce }: { header: Header | null; mortalLength: number; nonce: Index },
    runtimeVersion: RuntimeVersion,
    genesisHash: string,
): SignatureOptions {
    if (!header) {
      if (isNumber(partialOptions.era)) {
        // since we have no header, it is immortal, remove any option overrides
        // so we only supply the genesisHash and no era to the construction
        delete partialOptions.era;
        delete partialOptions.blockHash;
      }
  
      return makeSignOptions(partialOptions, { nonce }, genesisHash, runtimeVersion, registry);
    }
  
    return makeSignOptions(partialOptions, {
        // blockHash: header.hash,
        // blockHash: partialOptions.blockHash || header.hash,
        era: registry.createTypeUnsafe<ExtrinsicEra>('ExtrinsicEra', [{
            current: header.number,
            period: partialOptions.era || mortalLength
        }]),
        nonce,
      },
      genesisHash,
      runtimeVersion,
      registry,
    );
}

function makeSignOptions (
    partialOptions: Partial<SignerOptions>,
    extras: { blockHash?: Hash; era?: ExtrinsicEra; nonce?: Index },
    genesisHash: string,
    runtimeVersion: RuntimeVersion,
    registry: TypeRegistry,
): SignatureOptions {
    return objectSpread(
        { genesisHash: genesisHash, runtimeVersion, signedExtensions: registry.signedExtensions, version: EXTRINSIC_VERSION },
        partialOptions,
        extras,
    );
}

// https://github.com/polkadot-js/api/blob/9f6f33844a636f44afc5dd3c66ba9355ab26bb0a/packages/api/src/submittable/createClass.ts#L293
export async function signViaSigner (
    address: Address | string | Uint8Array,
    options: SignatureOptions,
    header: Header | null,
    signer: Signer,
    registry: TypeRegistry,
    method: string,
    metadataRpc: `0x${string}`,
): Promise<`0x${string}`> {
    console.log("signViaSigner - SignatureOptions", options);
  	registry.setMetadata(createMetadata(registry, metadataRpc));
    const payload = registry.createTypeUnsafe<SignerPayload>('SignerPayload', [objectSpread({}, options, {
      address,
      blockNumber: header ? header.number : 0,
      method,
    })]);
    let result: SignerResult;

    if (signer.signPayload) {
      result = await signer.signPayload(payload.toPayload());
    } else if (signer.signRaw) {
      result = await signer.signRaw(payload.toRaw());
    } else {
      throw new Error('Invalid signer interface, it should implement either signPayload or signRaw (or both)');
    }

    return result.signature;
};

/**
 * Serialize a signed transaction in a format that can be submitted over the
 * Node RPC Interface from the signing payload and signature produced by the
 * remote signer.
 *
 * @param unsigned - The JSON representing the unsigned transaction.
 * @param signature - Signature of the signing payload produced by the remote
 * signer. A signed ExtrinsicPayload returns a signature with the type `0x${string}` via polkadot-js.
 * @param options - Registry and metadata used for constructing the method.
 */
 export function createSignedTx(
	unsigned: UnsignedTransaction,
	signature: `0x${string}`,
	options: OptionsWithMeta
): string {
	const {
		metadataRpc,
		registry,
		asCallsOnlyArg,
		signedExtensions,
		userExtensions,
	} = options;
	const metadata = createMetadata(registry, metadataRpc, asCallsOnlyArg);

	registry.setMetadata(metadata, signedExtensions, userExtensions);

	const extrinsic = registry.createType(
		'Extrinsic',
		{ method: unsigned.method },
		{ version: unsigned.version }
	);

	extrinsic.addSignature(unsigned.address, signature, unsigned);

	return extrinsic.toHex();
}

/**
 * Construct the signing payload from an unsigned transaction and export it to
 * a remote signer (this is often called "detached signing").
 *
 * **Important!** The registry needs to be passed into the `options` argument.
 * This registry needs to be updated with latest metadata, so before calling
 * this function, make sure to run `registry.setMetadata(metadata)` first.
 *
 * **Important!** The return value of this function is **NOT** the actual
 * payload to sign: the actual payload to sign includes `method` which should
 * not be length-prefixed. To construct the actual payload to sign, see the
 * example.
 *
 * @param unsigned - The JSON representing the unsigned transaction.
 * @param options - Registry and metadata used for constructing the method.
 *
 * @example
 * ```ts
 * // Serialized signing payload.
 * const signingPayload = createSigningPayload(unsigned, {
 *   metadataRpc,
 *   registry
 * });
 *
 * // Construct an `ExtrinsicPayload` class. Careful, the `version` here is the
 * // `TRANSACTION_VERSION` format version, and **NOT** the
 * // `transaction_version` field from the `state_getRuntimeVersion` RPC
 * // endpoint.
 * const extrinsicPayload = registry
 *   .createType('ExtrinsicPayload', unsigned, {
 *     version: unsigned.version,
 *  });
 *
 * // With the `ExtrinsicPayload` class, construct the actual payload to sign.
 * // N.B. signing payloads > 256 bytes get hashed with blake2_256
 * // ref: https://github.com/paritytech/substrate/blob/master/primitives/runtime/src/generic/unchecked_extrinsic.rs#L171-L220
 * extrinsicPayloadU8a = extrinsicPayload.toU8a({ method: true })
 * const actualPayload = extrinsicPayloadU8a.length > 256
 *   ? registry.hash(extrinsicPayloadU8a)
 *   : extrinsicPayloadU8a;
 *
 * // You can now sign `actualPayload` with your private key.
 * // Note: you can use `u8ToHex` from @polkadot/util to convert `actualPayload`
 * // to a hex string.
 *
 * // Alternatively, call the `.sign()` method directly on the
 * `ExtrinsicPayload` class.
 * const { signature } = extrinsicPayload.sign(myKeyPair);
 * ```
 */
 export function createSigningPayload(
	unsigned: UnsignedTransaction,
	options: Options
): string {
	const { registry } = options;
	return registry
		.createType('ExtrinsicPayload', unsigned, {
			version: unsigned.version,
		})
		.toHex();
}

export async function generateSignedTx(
    address: string,
    signer: Signer,
    method: (args: any, info: BaseTxInfo, options: OptionsWithMeta) => UnsignedTransaction,
    args: Args,
): Promise<string> {
    const chainInfo = await getChainInfo();
    const nonce = await getNonce(address);
    const registry = getRegistry({
        chainName: 'Updater',
        specName: chainInfo.runtimeVersion.specName,
        specVersion: chainInfo.runtimeVersion.specVersion,
        metadataRpc: chainInfo.metadataRpc,
    });

    const unsigned = method(
        args,
        {
           //  address: deriveAddress(alice.publicKey, 42), // TODO, use correct prefix
            address: address,
            blockHash: chainInfo.blockHash,
            blockNumber: registry
                .createType('BlockNumber', chainInfo.block.header.number)
                .toNumber(),
            eraPeriod: 64,
            genesisHash: chainInfo.genesisHash,
            metadataRpc: chainInfo.metadataRpc,
            nonce,
            specVersion: chainInfo.runtimeVersion.specVersion,
            tip: 0,
            transactionVersion: chainInfo.runtimeVersion.transactionVersion,
        },
        {
            metadataRpc: chainInfo.metadataRpc,
            registry,
        }
    );

    // Construct the signing payload from an unsigned transaction.
    const signingPayload = createSigningPayload(unsigned, { registry });
    console.log(`\n[Injected] Payload to Sign: ${signingPayload}`);

    const eraOptions = makeEraOptions(
        registry,
        // Partial<SignerOptions>
        {
            blockHash: chainInfo.blockHash,
            nonce,
            signer,
        },
        {
            header: chainInfo.block.header,
            mortalLength: chainInfo.mortalLength,
            nonce,
        },
        chainInfo.runtimeVersion,
        chainInfo.genesisHash,
    );
    const signature = await signViaSigner(
        address,
        eraOptions,
        chainInfo.block.header,
        signer,
        registry,
        unsigned.method,
        chainInfo.metadataRpc,
    );
    console.log(`\n[Injected] Signature: ${signature}`);

    // Encode a signed transaction.
    const signedTx = createSignedTx(unsigned, signature, {
        metadataRpc: chainInfo.metadataRpc,
        registry,
    });
    console.log(`\n[Injected] Transaction to Submit: ${signedTx}`);

    return signedTx;
}