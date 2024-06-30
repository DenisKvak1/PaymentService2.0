import { CreateShopDTO } from '../../repository/DTO/shopRepositoryDTO';
import { IShop } from '../../models/Shop';
import { bankInfo, ICardRequisites, IConnection } from '../../../../env/types';
import { CreateTransactionDTO } from '../../repository/DTO/transactionDTO';
import { ITransaction, TransactionInfo } from '../../models/Transaction';

export type IShopService = {
	create(dto: CreateShopDTO): IShop
	setName(id: string, name: string): void
	getByID(id: string): Promise<IShop | undefined>
	setRequisites(id: string, bankType: string, requisites: number | string): void
	delete(id: string): void
}
export type ITransactionService = {
	create(dto: CreateTransactionDTO): ITransaction
	getAvailableBanks(id: string): Promise<bankInfo[]>
	getInfo(id: string): TransactionInfo
	selectBank(id: string, connection: IConnection): Promise<void>
	cancelTransaction(id: string): void
	backToSelectBank(id: string): void
	confirmPayment(id: string, requisites: ICardRequisites): Promise<boolean>
	confirmTransaction(id: string): void
	destroy(id: string): void
	getByID(id: string): ITransaction | undefined
	isExist(id: string): boolean
}