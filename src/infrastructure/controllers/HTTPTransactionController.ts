import { TransactionRepository } from '../../core/repository/TransactionRepository';
import { ShopService } from '../../core/services/ShopService';
import * as express from 'express';
import { IShop } from '../../core/models/Shop';
import { bank } from '../modules/bank';
import { TransactionSTATE } from '../../core/entity/interface/types';

export class HTTPTransactionController {
	constructor(
		private transactionRepository: TransactionRepository,
		private shopService: ShopService,
	) {
	}

	async create(req: express.Request, res: express.Response) {   /// TODO
		try {
			const { shop_token, meta, sum } = req.body;
			if (!({} as any).testToken(shop_token as any))
				return res.json({
					status: 'error',
					errorText: 'Токен магазина не правильный',
				});

			const shop = await this.shopService.getByToken(shop_token) as IShop;
			const transaction = this.transactionRepository.create({ shop, sum, meta });
			res.json({ status: 'ok', transactionInfo: transaction.getInfo() });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async getTransactionInfo(req: express.Request, res: express.Response) {
		try {
			const { transaction_id } = req.body;
			const transaction = this.transactionRepository.getByID(transaction_id);

			if (!transaction) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}

			res.json({ status: 'ok', transactionInfo: transaction.getInfo() });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async getAvailableBanks(req: express.Request, res: express.Response) {
		try {
			const { transaction_id } = req.body;
			const transaction = this.transactionRepository.getByID(transaction_id);

			if (!transaction) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}

			res.json({ status: 'ok', transactionInfo: transaction.getAvailableBanks() });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async selectBank(req: express.Request, res: express.Response) {
		try {
			const { transaction_id, bank_name } = req.body;
			const transaction = this.transactionRepository.getByID(transaction_id);
			const state = transaction?.getInfo()?.state;

			if (!transaction) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}
			if (!bank.getBankConnectionByName(bank_name)) {
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
			transaction.selectBank(bank.getBankConnectionByName(bank_name));
			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}


	confirmPayment(req: express.Request, res: express.Response) {
		try {
			const { transaction_id, requisites } = req.body;
			const transaction = this.transactionRepository.getByID(transaction_id);
			const state = transaction?.getInfo()?.state;

			if (!transaction) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}
			if (state !== TransactionSTATE.WAITING_FOR_REQUISITES_STATE) {
				return res.json({
					status: 'error',
					errorText: 'Оплата уже подтверженна',
				});
			}
			transaction.confirmPayment(requisites);
			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	cancel(req: express.Request, res: express.Response) {
		try {
			const { transaction_id } = req.body;
			const transaction = this.transactionRepository.getByID(transaction_id);
			const state = transaction?.getInfo()?.state;
			if (!transaction) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция не найденна',
				});
			}
			if (state === TransactionSTATE.FINISHED_STATE || state === TransactionSTATE.DELETED_STATE) {
				return res.json({
					status: 'error',
					errorText: 'Транзакция уже выполненна',
				});
			}
			transaction.cancelTransaction();
			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}
}