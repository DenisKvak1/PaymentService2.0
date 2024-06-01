
import { IShop, Meta } from '../../../../env/types';

export type CreateTransactionDTO = {
	shop: IShop,
	meta: Meta,
	sum: number
}