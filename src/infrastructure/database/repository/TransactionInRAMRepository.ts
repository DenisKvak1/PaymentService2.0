import { ITransactionRepository } from '../../../core/repository/ITransactionRepository';
import { CreateTransactionDTO, UpdateTransactionDTO } from '../../../core/repository/DTO/transactionDTO';
import { v4 as uuidv4 } from 'uuid';
import { ITransaction, TransactionSTATE } from '../../../core/models/Transaction';
import { shopInMemoryRepository } from './ShopInMemoryRepository';

export class TransactionInRAMRepository implements ITransactionRepository {
	private readonly transactions: ITransaction[] = [];


	create(dto: CreateTransactionDTO): ITransaction {
		const transaction = {
			id: uuidv4(),
			shop: dto.shop,
			bank: null,
			meta: dto.meta,
			sum: dto.sum,
			state: TransactionSTATE.SELECT_BANK_STATE,
		} as ITransaction;
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

	update(id: string, dto: UpdateTransactionDTO): void {
		const transaction = this.transactions.find((item) => item.id === id);
		for (const key in dto) {
			transaction[key] = dto[key];
		}
	}
}

export const transactionInRAMRepository = new TransactionInRAMRepository();