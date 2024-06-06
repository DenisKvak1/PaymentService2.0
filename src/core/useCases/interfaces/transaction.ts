import { CreateTransactionDTO } from '../../repository/DTO/transactionDTO';
import { ITransaction, TransactionInfo } from '../../models/Transaction';
import { ICardRequisites, IConnection, TransactionDoInfo } from '../../../../env/types';

export type ITransactionUseCases= {
	create(dto: CreateTransactionDTO): ITransaction
	getAvailableBanks(id: string): Promise<string[]>
	getInfo(id: string): TransactionInfo | undefined
	selectBank(id: string, connection: IConnection): Promise<TransactionDoInfo>
	cancelTransaction(id: string): TransactionDoInfo
	backToSelectBank(id: string): TransactionDoInfo
	confirmPayment(id: string, requisites: ICardRequisites): Promise<TransactionDoInfo>
	confirmTransaction(id: string): TransactionDoInfo
	destroy(id: string): void
	isExist(id: string): boolean
}