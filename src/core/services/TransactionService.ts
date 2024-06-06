import { ITransactionRepository } from '../repository/ITransactionRepository';
import { ICardRequisites, IConnection, TransactionDoInfo } from '../../../env/types';
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

	async selectBank(id: string, connection: IConnection): Promise<TransactionDoInfo> {
		const transaction = this.transactionRepository.getByID(id);
		const stateFunctions: { [key in TransactionSTATE]: Function } = {
			[TransactionSTATE.SELECT_BANK_STATE]: async () => {
				const banks = await this.getAvailableBanks(id);
				const includeBank = banks.includes(connection.getName());

				if (!includeBank) {
					return {
						success: false,
						error: 'Данная система оплаты не доступна',
					};
				}
				this.transactionRepository.update(id, {
					bank: connection,
					state: TransactionSTATE.WAITING_FOR_REQUISITES_STATE,
				});
				return {
					success: true,
					error: '',
				};
			},
			[TransactionSTATE.WAITING_FOR_REQUISITES_STATE]: () => {
				return {
					success: false,
					error: 'Банк уже выбран',
				};
			},
			[TransactionSTATE.WAITING_CONFIRMATION_STATE]: () => {
				return {
					success: false,
					error: 'Банк уже выбран',
				};
			},
			[TransactionSTATE.FINISHED_SUCCESS_STATE]: () => {
				return {
					success: false,
					error: 'Банк уже выбран',
				};
			},
			[TransactionSTATE.FINISHED_REJECT_STATE]: () => {
				return {
					success: false,
					error: 'Банк уже выбран',
				};
			},
			[TransactionSTATE.DELETED_STATE]: () => {
				return {
					success: false,
					error: 'Транзакция удаленна',
				};
			},
		};

		return stateFunctions[transaction.state]();
	}

	cancelTransaction(id: string): TransactionDoInfo {
		const transaction = this.transactionRepository.getByID(id);
		if (
			transaction.state === TransactionSTATE.DELETED_STATE ,
			transaction.state === TransactionSTATE.FINISHED_REJECT_STATE,
			transaction.state === TransactionSTATE.FINISHED_SUCCESS_STATE
		) {
			return {
				success: false,
				error: 'На данном этапе отменить транзакцию нельзя',
			};
		}
		this.transactionRepository.update(id, { state: TransactionSTATE.FINISHED_REJECT_STATE });
		return { success: true, error: '' };
	}

	backToSelectBank(id: string): TransactionDoInfo {
		const transaction = this.transactionRepository.getByID(id);
		if (transaction.state !== TransactionSTATE.WAITING_FOR_REQUISITES_STATE) {
			return {
				success: false,
				error: 'На данном этапе нельзя вернуться к выбору банков',
			};
		}
		this.transactionRepository.update(id, { bank: null, state: TransactionSTATE.SELECT_BANK_STATE });
		return { success: true, error: '' };
	}

	async confirmPayment(id: string, requisites: ICardRequisites): Promise<TransactionDoInfo> {
		const transaction = this.transactionRepository.getByID(id);
		if(transaction.state !== TransactionSTATE.WAITING_FOR_REQUISITES_STATE) {
			return {
				success: false,
				error: "На данном этапе нельзя оплатить"
			}
		}
		const debitID = await transaction.bank.debitRequest(requisites, transaction.shop.requisites[transaction.bank.getName()].number, transaction.sum);

		if (!debitID) return {
			success: false,
			error: "Оплата не удалась, повторите позже"
		};
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
		return { success: true, error: '' };
	}

	confirmTransaction(id: string): TransactionDoInfo {
		const transaction = this.transactionRepository.getByID(id);
		if(transaction.state !== TransactionSTATE.WAITING_CONFIRMATION_STATE) {
			return {
				success: false,
				error: "Транзакции не ждёт подтвердение"
			}
		}
		this.transactionRepository.update(id, { state: TransactionSTATE.FINISHED_SUCCESS_STATE });
		return {
			success: true,
			error: ""
		}
	}

	destroy(id: string): void {
		this.transactionRepository.update(id, { state: TransactionSTATE.DELETED_STATE });
		this.transactionRepository.delete(id);
	}

	isExist(id: string): boolean {
		return Boolean(this.transactionRepository.getByID(id));
	}
}

export const transactionService = new TransactionService(transactionInRAMRepository);