import { IConnection, IShop, Meta } from '../../../../env/types';

import { TransactionSTATE } from '../../models/Transaction';

export type CreateTransactionDTO = {
	shop: IShop,
	meta: Meta,
	sum: number
}
export type UpdateTransactionDTO = {
	state?: TransactionSTATE
	bank?: IConnection,
	meta?: Meta
	sum?: number
}