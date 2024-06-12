import { ITransactionUseCases } from './interfaces/transaction';
import { DoInfo, ICardRequisites, IConnection } from '../../../env/types';
import { CreateTransactionDTO, CreateUseCasesTransactionDTO } from '../repository/DTO/transactionDTO';
import { TransactionSTATE } from '../models/Transaction';
import { IShopService, ITransactionService } from '../services/interface/types';
import { transactionService } from '../services/TransactionService';
import { requisitesValidator } from '../validators/RequisitesValidator';
import { transactionValidator } from '../validators/TransactionValidator';
import { shopService } from '../services/ShopService';
import { checkNullObject } from '../../../env/helpers/checkNullObject';
import { transactionInRAMRepository } from '../../infrastructure/database/repository/TransactionInRAMRepository';

export class TransactionUseCases implements ITransactionUseCases {
	constructor(
		private transactionService: ITransactionService,
		private shopService: IShopService,
	) {
	}

	backToSelectBank(id: string): DoInfo {
		const transaction = this.transactionService.getByID(id);
		if (!transaction) {
			return {
				success: false,
				error: 'Транзакция не найденна',
			};
		}
		if (transaction.state !== TransactionSTATE.WAITING_FOR_REQUISITES_STATE) {
			return {
				success: false,
				error: 'На данном этапе нельзя вернуться к выбору банков',
			};
		}
		this.transactionService.backToSelectBank(id);
		return { success: true, error: '' };
	}

	cancelTransaction(id: string): DoInfo {
		const transaction = this.transactionService.getByID(id);
		if (!transaction) {
			return {
				success: false,
				error: 'Транзакция не найденна',
			};
		}
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
		this.transactionService.cancelTransaction(id);
		return { success: true, error: '' };
	}

	async confirmPayment(id: string, requisites: ICardRequisites): Promise<DoInfo> {
		const transaction = this.transactionService.getByID(id);
		if (!transaction) {
			return {
				success: false,
				error: 'Транзакция не найденна',
			};
		}
		if (transaction.state === TransactionSTATE.SELECT_BANK_STATE) {
			return {
				success: false,
				error: 'Банк еще не выбран',
			};
		}
		if (transaction.state !== TransactionSTATE.WAITING_FOR_REQUISITES_STATE) {
			return {
				success: false,
				error: 'На данном этапе нельзя оплатить',
			};
		}
		if(!await transaction.bank.ping()){
			return {
				success: false,
				error: "Банк не доступен попробуйте позже"
			}
		}
		const validResult = await requisitesValidator.validateCardRequisites(requisites)
		if (!validResult.valid) {
			return {
				success: false,
				error: validResult.errors.join(", "),
			};
		}
		if(!await transaction.bank.isValidRequisites(requisites)){
			return {
				success: false,
				error: "Реквезиты не корректны"
			}
		}

		if(!await transaction.bank.checkSufficientBalance(requisites.number.toString(), transaction.sum)){
			return {
				success: false,
				error: "Сумма не достаточна для оплаты"
			}
		}

		const isOkPayment = await this.transactionService.confirmPayment(id, requisites);
		if (!isOkPayment) {
			return {
				success: false,
				error: 'Оплата не удалась, попробуйте позже',
			};
		}
		return { success: true, error: '' };
	}

	confirmTransaction(id: string): DoInfo {
		const transaction = this.transactionService.getByID(id);
		if (!transaction) {
			return {
				success: false,
				error: 'Транзакция не найденна',
			};
		}
		if (transaction.state !== TransactionSTATE.WAITING_CONFIRMATION_STATE) {
			return {
				success: false,
				error: 'Транзакции не ждёт подтвердение',
			};
		}
		this.transactionService.confirmTransaction(id);
		return { success: true, error: '' };
	}

	async create(dto: CreateUseCasesTransactionDTO): Promise<DoInfo> {
		const validateResult = transactionValidator.metaValidate(dto.meta);
		if (!validateResult.valid) {
			return {
				success: false,
				error: validateResult.errors.join(' '),
			};
		}
		const shop = await this.shopService.getByID(dto.shopID)
		if(checkNullObject(shop.requisites)){
			return {
				success: false,
				error: 'Реквезиты пусты'
			}
		}
		return {
			success: true,
			error: '',
			data: transactionService.create({shop, meta: dto.meta, sum: dto.sum}),
		};
	}

	destroy(id: string): void {
		this.transactionService.destroy(id);
	}

	getAvailableBanks(id: string): Promise<string[]> {
		return this.transactionService.getAvailableBanks(id);
	}

	getInfo(id: string): DoInfo {
		const transaction = this.transactionService.getInfo(id)
		if(!transaction){
			return {
				success: false,
				error: "Транзакция не найденна"
			}
		}
		return {
			success: true,
			error: '',
			data: transaction
		}
	}

	isExist(id: string): boolean {
		return this.transactionService.isExist(id);
	}

	async selectBank(id: string, connection: IConnection): Promise<DoInfo> {
		const transaction = this.transactionService.getByID(id);
		if (!transaction) {
			return {
				success: false,
				error: 'Транзакция не найденна',
			};
		}
		const stateFunctions: { [key in TransactionSTATE]: Function } = {
			[TransactionSTATE.SELECT_BANK_STATE]: async () => {
				const banks = await transactionService.getAvailableBanks(id);
				const includeBank = banks.includes(connection.getName());

				if (!includeBank) {
					return {
						success: false,
						error: 'Данная система оплаты не доступна',
					};
				}
				await this.transactionService.selectBank(id, connection);
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
}

export const transactionUseCases = new TransactionUseCases(transactionService, shopService);