import {
    Args,
	BaseTxInfo,
	OptionsWithMeta,
	UnsignedTransaction,
} from '../types';
import { defineMethod } from './defineMethod';

export interface DoSomethingArgs extends Args {
	value: number | string;
}

export function doSomething(
	args: DoSomethingArgs,
	info: BaseTxInfo,
	options: OptionsWithMeta
): UnsignedTransaction {
	return defineMethod(
		{
			method: {
				args,
				name: 'doSomething',
				pallet: 'templateModule',
			},
			...info,
		},
		options
	);
}