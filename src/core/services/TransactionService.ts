import { ITransactionRepository } from '../repository/ITransactionRepository';
import { ICardRequisites, IConnection } from '../../../env/types';
import { bankHelper } from '../../infrastructure/modules/bankHelper';
import { config } from '../../../env/config';
import { ITransaction, TransactionInfo, TransactionSTATE } from '../models/Transaction';
import { CreateTransactionDTO } from '../repository/DTO/transactionDTO';
import { transactionInRAMRepository } from '../../infrastructure/database/repository/TransactionInRAMRepository';
import { ITransactionService } from './interface/types';

export class TransactionService implements ITransactionService{
	constructor(
		private transactionRepository: ITransactionRepository,
	) {
	}

	create(dto: CreateTransactionDTO): ITransaction {
		return this.transactionRepository.create(dto);
	}

	async getAvailableBanks(id: string): Promise<string[]> {
		const transaction = this.transactionRepository.getByID(id);
		const availableBanks: string[] = [];
		for (const key in transaction.shop.requisites) {
			if (transaction.shop.requisites[key]) {
				const connection = bankHelper.getBankConnectionByName(key);
				if (!connection) continue;
				const isPinged = await connection.ping();
				if (!isPinged) continue;
				availableBanks.push(key);
			}
		}
		return availableBanks;
	}

	getInfo(id: string): TransactionInfo {
		const transaction = this.transactionRepository.getByID(id);
		return {
			state: transaction.state,
			meta: transaction.meta,
			sum: transaction.sum,
		};
	}

	async selectBank(id: string, connection: IConnection): Promise<boolean> {
		this.transactionRepository.update(id, { bank: connection });

		const banks =  await this.getAvailableBanks(id)
		const includeBank = banks.includes(connection.getName())

		if(!includeBank) return false
		this.transactionRepository.update(id, { bank: connection, state: TransactionSTATE.WAITING_FOR_REQUISITES_STATE});
		return true
	}

	cancelTransaction(id: string): void {
		this.transactionRepository.update(id, { state: TransactionSTATE.FINISHED_REJECT_STATE });
	}

	backToSelectBank(id: string): void {
		this.transactionRepository.update(id, { state: TransactionSTATE.SELECT_BANK_STATE });
	}

	async confirmPayment(id: string, requisites: ICardRequisites): Promise<boolean> {
		const transaction = this.transactionRepository.getByID(id);
		const debitID = await transaction.bank.debitRequest(requisites, transaction.shop.requisites[transaction.bank.getName()].number, transaction.sum);

		if (!debitID) return false;
		const subscribe = transaction.bank.subscribeOnDebitResponse(debitID, (success) => {
			if (success) {
				this.confirmTransaction(id);
			} else {
				this.cancelTransaction(id);
			}
			setTimeout(() => {
				this.destroy(id);
			}, config.TIMEOUT_DELETE);
		});
		setTimeout(() => {
			if (
				transaction.state !== TransactionSTATE.FINISHED_SUCCESS_STATE &&
				transaction.state !== TransactionSTATE.DELETED_STATE &&
				transaction.state !== TransactionSTATE.FINISHED_REJECT_STATE
			) {
				subscribe.unsubscribe();
				this.cancelTransaction(id);
				this.destroy(id);
			}
		}, config.TIMEOUT_EXPIRED);
		this.transactionRepository.update(id, {state: TransactionSTATE.WAITING_CONFIRMATION_STATE})
		return true;
	}

	confirmTransaction(id: string): void {
		this.transactionRepository.update(id, { state: TransactionSTATE.FINISHED_SUCCESS_STATE });
	}

	destroy(id: string): void {
		this.transactionRepository.update(id, { state: TransactionSTATE.DELETED_STATE });
		this.transactionRepository.delete(id);
	}

	isExist(id: string): boolean {
		return Boolean(this.transactionRepository.getByID(id));
	}
}
export const transactionService = new TransactionService(transactionInRAMRepository)