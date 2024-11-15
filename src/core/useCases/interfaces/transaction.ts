import { CreateTransactionDTO, CreateUseCasesTransactionDTO } from '../../repository/DTO/transactionDTO';
import { ITransaction, TransactionInfo } from '../../models/Transaction';
import { ICardRequisites, IConnection, DoInfo, bankInfo } from '../../../../env/types';

export type ITransactionUseCases = {
	create(dto: CreateUseCasesTransactionDTO): Promise<DoInfo>
	getAvailableBanks(id: string): Promise<bankInfo[]>
	getInfo(id: string): DoInfo
	selectBank(id: string, connection: IConnection): Promise<DoInfo>
	cancelTransaction(id: string): DoInfo
	backToSelectBank(id: string): DoInfo
	confirmPayment(id: string, requisites: ICardRequisites): Promise<DoInfo>
	confirmTransaction(id: string): DoInfo
	destroy(id: string): void
	isExist(id: string): boolean
}
