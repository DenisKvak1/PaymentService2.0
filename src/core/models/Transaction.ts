import { IConnection, IShop, Meta } from '../../../env/types';

export enum TransactionSTATE {
	SELECT_BANK_STATE = 'SELECT_BANK_STATE',
	WAITING_FOR_REQUISITES_STATE = 'WAITING_FOR_REQUISITES_STATE',
	WAITING_CONFIRMATION_STATE = 'WAITING_CONFIRMATION_STATE',
	FINISHED_SUCCESS_STATE = 'FINISHED_SUCCESS_STATE',
	FINISHED_REJECT_STATE = 'FINISHED_REJECT_STATE',
	DELETED_STATE = 'DELETED_STATE'
}

export type TransactionInfo = {
	state: TransactionSTATE
	meta: Meta
	sum: number
}

export type ITransaction = {
	id: string
	shop: IShop
	bank: IConnection
	state: TransactionSTATE
	meta: Meta
	sum: number
}