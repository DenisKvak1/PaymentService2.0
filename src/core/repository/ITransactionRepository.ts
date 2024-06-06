import { CreateTransactionDTO, UpdateTransactionDTO } from './DTO/transactionDTO';
import { ITransaction } from '../models/Transaction';

export type ITransactionRepository = {
	create(dto: CreateTransactionDTO): ITransaction
	getByID(id: string): undefined | ITransaction
	delete(id: string): void
	update(id: string, dto: UpdateTransactionDTO): void
}