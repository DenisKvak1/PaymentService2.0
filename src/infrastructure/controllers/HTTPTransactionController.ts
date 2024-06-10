import { shopService } from '../../core/services/ShopService';
import * as express from 'express';
import { IShop } from '../../core/models/Shop';
import { bankHelper } from '../modules/bankHelper';
import { authorizationService } from '../modules/authorizationService';
import { ITransactionUseCases } from '../../core/useCases/interfaces/transaction';
import { transactionUseCases } from '../../core/useCases/transactionUseCases';

export class HTTPTransactionController {
	constructor(
		private transactionUseCases: ITransactionUseCases,
	) {
	}

	async create(req: express.Request, res: express.Response) {
		try {
			const { meta, sum } = req.body;
			const authorizationData = authorizationService.getData(req.headers['authorization']);

			const transactionDoInfo = this.transactionUseCases.create({
				shopID: authorizationData.id,
				sum,
				meta: { name: meta.name, description: meta.description },
			});
			if(!transactionDoInfo.success){
				res.json({
					status: 'error',
					errorText: transactionDoInfo.error
				})
			}
			res.json({
				status: 'ok',
				transactionInfo: { id: transactionDoInfo.data.id, ...this.transactionUseCases.getInfo(transactionDoInfo.data.id).data },
			});
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async getTransactionInfo(req: express.Request, res: express.Response) {
		try {
			const transaction_id = req.params.id;
			const transactionDoInfo = this.transactionUseCases.getInfo(transaction_id);
			if (!transactionDoInfo.success) {
				return res.json({
					status: 'error',
					errorText: transactionDoInfo.error,
				});
			}

			res.json({ status: 'ok', transactionInfo:  transactionDoInfo});
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}


	async getAvailableBanks(req: express.Request, res: express.Response) {
		try {
			const transaction_id = req.params.id;

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
			const transactionDoInfo = await this.transactionUseCases.confirmPayment(transaction_id, requisites);

			if (!transactionDoInfo.success) return res.json({ status: 'error', errorText: transactionDoInfo.error });

			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	cancel(req: express.Request, res: express.Response) {
		try {
			const { transaction_id } = req.body;

			const transactionDoInfo = this.transactionUseCases.cancelTransaction(transaction_id);
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
}

export const httpTransactionController = new HTTPTransactionController(transactionUseCases);