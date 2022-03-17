import '@polkadot/api-augment';
import { TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';

import { createMetadata } from './metadata';
import { GetRegistryBaseArgs, GetRegistryOptsCore, OptionsWithMeta, UnsignedTransaction } from './types';


export enum PolkadotSS58Format {
	polkadot = 0,
	kusama = 2,
	westend = 42,
	substrate = 42,
}

/**
 * `ChainProperties` for networks that txwrapper-polkadot supports. These are normally returned
 * by `system_properties` call, but since they don't change much, it's pretty safe to hardcode them.
 */
 const KNOWN_CHAIN_PROPERTIES = {
	kusama: {
		ss58Format: PolkadotSS58Format.kusama,
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
	},
	polkadot: {
		ss58Format: PolkadotSS58Format.polkadot,
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
	},
	westend: {
		ss58Format: PolkadotSS58Format.westend,
		tokenDecimals: 12,
		tokenSymbol: 'WND',
	},
	statemint: {
		ss58Format: PolkadotSS58Format.polkadot,
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
	},
	statemine: {
		ss58Format: PolkadotSS58Format.kusama,
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
	},
};

/**
 * Create a type registry given chainProperties, specTypes, and metadataRpc.
 */
 export function getRegistryBase({
	chainProperties,
	specTypes,
	metadataRpc,
	asCallsOnlyArg,
	signedExtensions,
	userExtensions,
}: GetRegistryBaseArgs): TypeRegistry {
	const registry = new TypeRegistry();

	const generatedMetadata = createMetadata(
		registry,
		metadataRpc,
		asCallsOnlyArg
	);

	registry.register(specTypes);

	registry.setMetadata(generatedMetadata, signedExtensions, userExtensions);

	// Register the chain properties for this registry
	registry.setChainProperties(
		registry.createType('ChainProperties', chainProperties)
	);

	return registry;
}

// We override the `specName` property of `GetRegistryOptsCore` in order to get narrower type specificity,
// hopefully creating a better experience for users.
/**
 * Options for txwrapper-polkadot's `getRegistry` function.
 */
export interface GetRegistryOpts extends GetRegistryOptsCore {
	specName: keyof typeof KNOWN_CHAIN_PROPERTIES;
}

/**
 * Get a type registry for networks that txwrapper-polkadot supports.
 *
 * @param GetRegistryOptions specName, chainName, specVersion, and metadataRpc of the current runtime
 */
export function getRegistry({
	specName,
	chainName,
	specVersion,
	metadataRpc,
	properties,
	asCallsOnlyArg,
	signedExtensions,
	userExtensions,
}: GetRegistryOpts): TypeRegistry {
	// The default type registry has polkadot types
	const registry = new TypeRegistry();

	// As of now statemine is not a supported specName in the default polkadot-js/api type registry.
	const chainNameAdjusted = chainName === 'Statemine' ? 'Statemint' : chainName;
	const specNameAdjusted = specName === 'statemine' ? 'statemint' : specName;

	return getRegistryBase({
		chainProperties: properties || KNOWN_CHAIN_PROPERTIES[specName],
		specTypes: getSpecTypes(
			registry,
			chainNameAdjusted,
			specNameAdjusted,
			specVersion
		),
		metadataRpc,
		asCallsOnlyArg,
		signedExtensions,
		userExtensions,
	});
}

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