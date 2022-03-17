import { AnyJson, RegistryTypes, SignerPayloadJSON } from '@polkadot/types/types';
import { TypeRegistry } from '@polkadot/types';
import { ExtDef } from '@polkadot/types/extrinsic/signedExtensions/types';

/**
 * JSON object of ChainProperties codec from `@polkadot/api`.
 */
 export interface ChainProperties {
	ss58Format?: number | null;
	tokenDecimals?: number[] | null;
	tokenSymbol?: string[] | null;
}

/**
 * JSON format for information that is common to all transactions.
 */
 export interface BaseTxInfo {
	/**
	 * The ss-58 encoded address of the sending account.
	 */
	address: string;
	/**
	 * The checkpoint hash of the block, in hex.
	 */
	blockHash: string;
	/**
	 * The checkpoint block number (u32), in hex.
	 */
	blockNumber: number;
	/**
	 * Describe the longevity of a transaction. It represents the validity from
	 * the `blockHash` field, in number of blocks. Defaults to 64 blocks.
	 *
	 * @default 64
	 */
	eraPeriod?: number;
	/**
	 * The genesis hash of the chain, in hex.
	 */
	genesisHash: string;
	/**
	 * The SCALE-encoded metadata, as a hex string. Can be retrieved via the RPC
	 * call `state_getMetadata`.
	 */
	metadataRpc: `0x${string}`;
	/**
	 * The nonce for this transaction.
	 */
	nonce: number;
	/**
	 * The current spec version of the runtime.
	 */
	specVersion: number;
	/**
	 * The tip for this transaction, in hex.
	 *
	 * @default 0
	 */
	tip?: number;
	/**
	 * The current transaction version for the runtime.
	 */
	transactionVersion: number;
}

/**
 * Base Argument object for methods.
 */
 export type Args = Record<string, AnyJson>;

/**
 * Format used in txwrapper to represent a method.
 */
 export interface TxMethod {
	args: Args;
	name: string;
	pallet: string;
}

/**
 * Complete information about a tx
 */
export interface TxInfo extends BaseTxInfo {
	method: TxMethod;
}

/**
 * JSON format for an unsigned transaction.
 */
 export interface UnsignedTransaction extends SignerPayloadJSON {
	/**
	 * The SCALE-encoded metadata, as a hex string. Can be retrieved via the RPC
	 * call `state_getMetadata`.
	 */
	metadataRpc: `0x${string}`;
}

/**
 * Runtime-specific options for encoding transactions. Pass these options to
 * functions that only require registry.
 */
 export interface Options {
	/**
	 * The type registry of the runtime.
	 */
	registry: TypeRegistry;
}

export interface GetRegistryBaseArgs {
	/**
	 * Chain properties, normally returned by the `system_properties` call.
	 */
	chainProperties: ChainProperties | AnyJson;
	/**
	 * Chain specific type definitions to registry.
	 */
	specTypes: RegistryTypes;
	/**
	 * Used to set the correct metadata for the registry
	 */
	metadataRpc: `0x${string}`;
	/**
	 * Used to reduce the metadata size by only having the calls
	 */
	asCallsOnlyArg?: boolean;
	/**
	 * Array of signedExtensions
	 */
	signedExtensions?: string[];
	/**
	 * User extensions used to inject into the type registry
	 */
	userExtensions?: ExtDef;
}


/**
 * Runtime-specific options for encoding/decoding transactions. Pass these
 * options to functions that require registry and metadata.
 */
 export interface OptionsWithMeta extends Options {
	/**
	 * The metadata of the runtime.
	 */
	metadataRpc: `0x${string}`;
	/**
	 * Used to reduce the metadata size by only having the calls
	 */
	asCallsOnlyArg?: boolean;
	/**
	 * Array of signedExtensions
	 */
	signedExtensions?: string[];
	/**
	 * User extensions used to inject into the type registry
	 */
	userExtensions?: ExtDef;
}

/**
 * Options for `getRegistry*` functions.
 */
 export interface GetRegistryOptsCore {
	/**
	 * Runtime specName
	 */
	specName: string;
	/**
	 * chainName
	 */
	chainName: string;
	/**
	 * Runtime specVersion
	 */
	specVersion: number;
	/**
	 * SCALE encoded runtime metadata as a hex string
	 */
	metadataRpc: `0x${string}`;
	/**
	 * Chain ss58format, token decimals, and token ID
	 */
	properties?: ChainProperties;
	/**
	 * Used to reduce the metadata size by only having the calls
	 */
	asCallsOnlyArg?: boolean;
	/**
	 * Array of signedExtensions
	 */
	signedExtensions?: string[];
	/**
	 * User extensions used to inject into the type registry
	 */
	userExtensions?: ExtDef;
}