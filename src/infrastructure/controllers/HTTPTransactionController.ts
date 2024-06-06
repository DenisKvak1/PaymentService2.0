import { shopService } from '../../core/services/ShopService';
import * as express from 'express';
import { IShop } from '../../core/models/Shop';
import { bankHelper } from '../modules/bankHelper';
import { authorizationService } from '../modules/authorizationService';
import { transactionValidator } from '../validators/TransactionValidator';
import { requisitesValidator } from '../validators/RequisitesValidator';
import { IShopService, ITransactionService } from '../../core/services/interface/types';
import { transactionService } from '../../core/services/TransactionService';
import { TransactionSTATE } from '../../core/models/Transaction';

export class HTTPTransactionController {
	constructor(
		private transactionService: ITransactionService,
		private shopService: IShopService,
	) {
	}

	async create(req: express.Request, res: express.Response) {
		try {
			const { meta, sum } = req.body;
			const authorizationData = authorizationService.getData(req.headers['authorization']);

			const metaValidateResult = transactionValidator.metaValidate(meta);
			if (!metaValidateResult.valid) {
				return res.json({
					status: 'error',
					errorText: metaValidateResult.errors.join(' '),
				});
			}

			const shop = await this.shopService.getByID(authorizationData.id) as IShop;
			const transaction = this.transactionService.create({
				shop,
				sum,
				meta: { name: meta.name, description: meta.description },
			});

			res.json({
				status: 'ok',
				transactionInfo: { id: transaction.id, ...this.transactionService.getInfo(transaction.id) },
			});
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async getTransactionInfo(req: express.Request, res: express.Response) {
		try {
			const transaction_id = req.params.id;
			const transaction = this.transactionService.isExist(transaction_id);
			if (!transaction) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}

			res.json({ status: 'ok', transactionInfo: this.transactionService.getInfo(transaction_id) });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}


	async getAvailableBanks(req: express.Request, res: express.Response) {
		try {
			const transaction_id = req.params.id;
			const isTransactionExist = this.transactionService.isExist(transaction_id);

			if (!isTransactionExist) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}

			res.json({
				status: 'ok',
				availableBanks: await this.transactionService.getAvailableBanks(transaction_id) || [],
			});
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async selectBank(req: express.Request, res: express.Response) {
		try {
			const { transaction_id, bank_name } = req.body;
			const isTransactionExist = this.transactionService.isExist(transaction_id);
			const state = this.transactionService.getInfo(transaction_id)?.state;

			if (!isTransactionExist) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}
			if (!bankHelper.getBankConnectionByName(bank_name)) {
				return res.json({
					status: 'error',
					errorText: 'Банк не найден',
				});
			}
			if (state !== TransactionSTATE.SELECT_BANK_STATE) {
				return res.json({
					status: 'error',
					errorText: 'Банк уже выбран',
				});
			}
			const isOKSelectBank = await this.transactionService.selectBank(transaction_id, bankHelper.getBankConnectionByName(bank_name));
			if (!isOKSelectBank) {
				return res.json({
					status: 'error',
					errorText: 'Этот способ оплаты не доступен',
				});
			}
			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}


	async confirmPayment(req: express.Request, res: express.Response) {
		try {
			const { transaction_id, requisites } = req.body;
			const isTransactionExist = this.transactionService.isExist(transaction_id);
			const state = this.transactionService.getInfo(transaction_id)?.state;

			if (!isTransactionExist) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}
			if (state === TransactionSTATE.SELECT_BANK_STATE) {
				return res.json({
					status: 'error',
					errorText: 'Банк не выбран',
				});
			}
			if (state !== TransactionSTATE.WAITING_FOR_REQUISITES_STATE) {
				return res.json({
					status: 'error',
					errorText: 'Оплата уже подтверженна',
				});
			}
			if (!await requisitesValidator.validateCardRequisites(requisites)) {
				return res.json({
					status: 'error',
					errorText: 'Реквезиты не корретные',
				});
			}
			const isOk = await this.transactionService.confirmPayment(transaction_id, requisites);

			if (!isOk) return res.json({ status: 'error', errorText: 'Реквезиты не корректны' });

			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	cancel(req: express.Request, res: express.Response) {
		try {
			const { transaction_id } = req.body;
			const isTransactionExist = this.transactionService.isExist(transaction_id);
			const state = this.transactionService.getInfo(transaction_id)?.state;

			if (!isTransactionExist) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}
			if (state === TransactionSTATE.FINISHED_SUCCESS_STATE || state === TransactionSTATE.FINISHED_REJECT_STATE || state === TransactionSTATE.DELETED_STATE) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция уже выполненна',
				});
			}
			this.transactionService.cancelTransaction(transaction_id);
			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}
}

export const httpTransactionController = new HTTPTransactionController(transactionService, shopService);