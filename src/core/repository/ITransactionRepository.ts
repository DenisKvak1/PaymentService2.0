import { ITransaction } from '../entity/interface/types';
import { CreateTransactionDTO } from './DTO/transactionDTO';

export type ITransactionRepository = {
	create(dto: CreateTransactionDTO): ITransaction
	getByID(id: string): undefined | ITransaction
	delete(id: string): void
}