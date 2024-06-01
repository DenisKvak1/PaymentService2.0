import { ICardRequisites, IConnection, IShop, Meta } from '../../../../env/types';

export type ITransaction = {
	id: string
	shop: IShop
	state: TransactionSTATEClass
	meta: Meta
	sum: number
	bank: IConnection
	getAvailableBanks(): string[]
	getInfo(): TransactionInfo
	selectBank(connection: IConnection): void
	cancelTransaction(): void
	goToRequisites(): void
	backToSelectBank(): void
	confirmPayment(requisites: ICardRequisites): boolean | void
	confirmTransaction(): void
	destroy(): void
}


export enum TransactionSTATE {
	SELECT_BANK_STATE = 'SELECT_BANK_STATE',
	WAITING_FOR_REQUISITES_STATE = 'WAITING_FOR_REQUISITES_STATE',
	WAITING_CONFIRMATION_STATE = 'WAITING_CONFIRMATION_STATE',
	FINISHED_STATE = 'FINISHED_STATE',
	DELETED_STATE = 'DELETED__STATE'
}

export type TransactionInfo = {
	state: TransactionSTATE
	meta: Meta
	sum: number
}

export abstract class TransactionSTATEClass {
	protected transaction: ITransaction;

	constructor(transaction: ITransaction) {
		this.transaction = transaction;
	}

	abstract selectBank(connection: IConnection): void

	abstract cancelTransaction(): void

	abstract goToRequisites(): void

	abstract backToSelectBank(): void

	abstract confirmPayment(requisites: ICardRequisites): Promise<boolean | void>

	abstract confirmTransaction(): void

	abstract destroy(): void

	abstract getName(): TransactionSTATE
}

