import memoizee from 'memoizee';
import { Metadata, TypeRegistry } from '@polkadot/types';
import {
	decorateConstants,
	decorateExtrinsics,
} from '@polkadot/types/metadata/decorate';
import { MetadataVersioned } from '@polkadot/types/metadata/MetadataVersioned';
import { Constants, Extrinsics } from '@polkadot/types/metadata/decorate/types';


/**
 * From a metadata hex string (for example returned by RPC), create decorated
 * modules with their calls (transactions).
 *
 * @ignore
 * @param registry - The registry of the metadata.
 * @param metadata - The metadata as hex string.
 */
export function createDecoratedTx(
	registry: TypeRegistry,
	metadataRpc: `0x${string}`
): Extrinsics {
	const metadata = createMetadata(registry, metadataRpc);
	return decorateExtrinsics(registry, metadata.asLatest, metadata.version);
}

/**
 * From a metadata hex string (for example returned by RPC), create decorated
 * modules with their constants.
 *
 * @param registry - The registry of the metadata.
 * @param metadata - The metadata as hex string.
 */
export function createDecoratedConstants(
	registry: TypeRegistry,
	metadataRpc: `0x${string}`
): Constants {
	const metadata = createMetadata(registry, metadataRpc);
	return decorateConstants(registry, metadata.asLatest, metadata.version);
}

/**
 * From a metadata hex string (for example returned by RPC), create a Metadata
 * class instance. Metadata decoding is expensive, so this function is
 * memoized.
 *
 * @ignore
 * @param registry - The registry of the metadata.
 * @param metadata - The metadata as hex string.
 * @param asCallsOnlyArg - Option to decreases the metadata to calls only
 */
 export function createMetadataUnmemoized(
	registry: TypeRegistry,
	metadataRpc: `0x${string}`,
	asCallsOnlyArg = false
): Metadata | MetadataVersioned {
	const metadata = new Metadata(registry, metadataRpc);
	return asCallsOnlyArg ? metadata.asCallsOnly : metadata;
}

/**
 * From a metadata hex string (for example returned by RPC), create a Metadata
 * class instance. Metadata decoding is expensive, so this function is
 * memoized.
 *
 * @ignore
 * @param registry - The registry of the metadata.
 * @param metadata - The metadata as hex string.
 * @param asCallsOnlyArg - Option to decreases the metadata to calls only
 */
export const createMetadata = memoizee(createMetadataUnmemoized, {
	length: 3,
});