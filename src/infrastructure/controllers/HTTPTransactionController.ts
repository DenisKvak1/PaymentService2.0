import { shopService } from '../../core/services/ShopService';
import * as express from 'express';
import { IShop } from '../../core/models/Shop';
import { bankHelper } from '../modules/bankHelper';
import { authorizationService } from '../modules/authorizationService';
import { transactionValidator } from '../validators/TransactionValidator';
import { requisitesValidator } from '../validators/RequisitesValidator';
import { IShopService } from '../../core/services/interface/types';
import { TransactionSTATE } from '../../core/models/Transaction';
import { ITransactionUseCases } from '../../core/useCases/interfaces/transaction';
import { transactionUseCases } from '../../core/useCases/transactionUseCases';

export class HTTPTransactionController {
	constructor(
		private transactionUseCases: ITransactionUseCases,
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
			const transaction = this.transactionUseCases.create({
				shop,
				sum,
				meta: { name: meta.name, description: meta.description },
			});

			res.json({
				status: 'ok',
				transactionInfo: { id: transaction.id, ...this.transactionUseCases.getInfo(transaction.id) },
			});
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async getTransactionInfo(req: express.Request, res: express.Response) {
		try {
			const transaction_id = req.params.id;
			const transaction = this.transactionUseCases.isExist(transaction_id);
			if (!transaction) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}

			res.json({ status: 'ok', transactionInfo: this.transactionUseCases.getInfo(transaction_id) });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}


	async getAvailableBanks(req: express.Request, res: express.Response) {
		try {
			const transaction_id = req.params.id;
			const isTransactionExist = this.transactionUseCases.isExist(transaction_id);

			if (!isTransactionExist) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}

			res.json({
				status: 'ok',
				availableBanks: await this.transactionUseCases.getAvailableBanks(transaction_id) || [],
			});
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async selectBank(req: express.Request, res: express.Response) {
		try {
			const { transaction_id, bank_name } = req.body;
			const isTransactionExist = this.transactionUseCases.isExist(transaction_id);

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
			const transactionDoInfo = await this.transactionUseCases.selectBank(transaction_id, bankHelper.getBankConnectionByName(bank_name));
			if (!transactionDoInfo.success) {
				return res.json({
					status: 'error',
					errorText: transactionDoInfo.error,
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
			const isTransactionExist = this.transactionUseCases.isExist(transaction_id);

			if (!isTransactionExist) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}

			if (!await requisitesValidator.validateCardRequisites(requisites)) {
				return res.json({
					status: 'error',
					errorText: 'Реквезиты не корретные',
				});
			}
			const transactionDoInfo = await this.transactionUseCases.confirmPayment(transaction_id, requisites);

			if (!transactionDoInfo.success) return res.json({ status: 'error', errorText: transactionDoInfo.error});

			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	cancel(req: express.Request, res: express.Response) {
		try {
			const { transaction_id } = req.body;
			const isTransactionExist = this.transactionUseCases.isExist(transaction_id);

			if (!isTransactionExist) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}

			const transactionDoInfo = this.transactionUseCases.cancelTransaction(transaction_id);
			if(!transactionDoInfo.success){
				return res.json({
					status: 'error',
					errorText: transactionDoInfo.error,
				});
			}
			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}
}

export const httpTransactionController = new HTTPTransactionController(transactionUseCases, shopService);