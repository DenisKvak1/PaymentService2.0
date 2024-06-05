import { ITransaction } from '../../../core/entity/interface/types';
import { ITransactionRepository } from '../../../core/repository/ITransactionRepository';
import { CreateTransactionDTO } from '../../../core/repository/DTO/transactionDTO';
import { Transaction } from '../../../core/entity/Transaction/Transaction';
import { v4 as uuidv4 } from 'uuid';

export class TransactionInRAMRepository implements ITransactionRepository {
	private readonly transactions: ITransaction[] = [];

	create(dto: CreateTransactionDTO): ITransaction {
		const transaction = new Transaction(uuidv4(), dto.shop, dto.meta, dto.sum);
		this.transactions.push(transaction);
		return transaction;
	}

	delete(id: string): void {
		const index = this.transactions.findIndex((item) => item.id === id);
		this.transactions.splice(index, 1);
	}

	getByID(id: string): ITransaction | undefined {
		return this.transactions.find((item) => item.id === id);
	}
}

export const transactionInRAMRepository = new TransactionInRAMRepository();