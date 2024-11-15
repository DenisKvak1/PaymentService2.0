import { ITransactionRepository } from '../repository/ITransactionRepository';
import { bankInfo, ICardRequisites, IConnection } from '../../../env/types';
import { bankHelper } from '../../infrastructure/modules/bankHelper';
import { config } from '../../../env/config';
import { ITransaction, TransactionInfo, TransactionSTATE } from '../models/Transaction';
import { CreateTransactionDTO } from '../repository/DTO/transactionDTO';
import { transactionInRAMRepository } from '../../infrastructure/database/repository/TransactionInRAMRepository';
import { ITransactionService } from './interface/types';

export class TransactionService implements ITransactionService {
	constructor(
		private transactionRepository: ITransactionRepository,
	) {
	}

	create(dto: CreateTransactionDTO): ITransaction {
		return this.transactionRepository.create(dto);
	}

	async getAvailableBanks(id: string): Promise<bankInfo[]> {
		const transaction = this.transactionRepository.getByID(id);
		const availableBanks:bankInfo[] = [];
		for (const key in transaction.shop.requisites) {
			if (transaction.shop.requisites[key]) {
				const connection = bankHelper.getBankConnectionByName(key);
				if (!connection) continue;
				const isPinged = await connection.ping();
				availableBanks.push({
					id: key,
					name: 'Мой банк',
					image: `http://${config.IP}/images/${key}Icon.png`,
					isAvailable: isPinged,
				});
			}
		}
		return availableBanks;
	}

	getInfo(id: string): TransactionInfo | undefined {
		const transaction = this.transactionRepository.getByID(id);
		if (!transaction) return undefined;
		return {
			state: transaction.state,
			meta: transaction.meta,
			sum: transaction.sum,
		};
	}

	async selectBank(id: string, connection: IConnection): Promise<void> {
		this.transactionRepository.update(id, {
			bank: connection,
			state: TransactionSTATE.WAITING_FOR_REQUISITES_STATE,
		});
	}

	cancelTransaction(id: string): void {
		this.transactionRepository.update(id, { state: TransactionSTATE.FINISHED_REJECT_STATE });
	}

	backToSelectBank(transactionID: string): void {
		this.transactionRepository.update(transactionID, { state: TransactionSTATE.SELECT_BANK_STATE });
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
		this.transactionRepository.update(id, { state: TransactionSTATE.WAITING_CONFIRMATION_STATE });
		return true;
	}

	confirmTransaction(id: string): void {
		this.transactionRepository.update(id, { state: TransactionSTATE.FINISHED_SUCCESS_STATE });
	}

	destroy(id: string): void {
		this.transactionRepository.update(id, { state: TransactionSTATE.DELETED_STATE });
		this.transactionRepository.delete(id);
	}

	getByID(id: string): ITransaction | undefined {
		return this.transactionRepository.getByID(id);
	}

	isExist(transactionID: string): boolean {
		return Boolean(this.transactionRepository.getByID(transactionID));
	}
}

export const transactionService = new TransactionService(transactionInRAMRepository);