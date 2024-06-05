import * as express from 'express';
import { authorizationService } from '../modules/authorizationService';
import { bankHelper } from '../modules/bankHelper';
import { IShopService } from '../../core/services/interface/types';
import { shopValidator } from '../validators/ShopValidator';
import { shopService } from '../../core/services/ShopService';
import { luhnCheck } from '../../../env/helpers/luhnCheck';

export class HTTPShopController {

	constructor(
		private shopService: IShopService,
	) {
	}

	create(req: express.Request, res: express.Response) {
		try {
			const { name } = req.body;

			const resultValidate = shopValidator.nameValidate(name);

			if (!resultValidate.valid) return res.json({ status: 'error', errorText: resultValidate.errors.join(' ') });

			const shop = this.shopService.create({ name });
			const token = authorizationService.createToken({ id: shop.id });
			res.json({ status: 'ok', jwt: token });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async setRequisites(req: express.Request, res: express.Response) {
		try {
			const { bankType, requisites } = req.body;
			const authorizationData = authorizationService.getData(req.headers['authorization']);

			const banks = {
				myBank: async (requisite: { number: string }) => {
					const connection = bankHelper.getBankConnectionByName('myBank');
					if (!luhnCheck(requisite.number.toString())) return false;
					if (!await connection.checkExistingRequisites(requisites.number)) return false;

					return true;
				},
			};

			const isValid = await banks[bankType](requisites);
			if (!isValid) return res.json({ status: 'Error', errorText: 'Реквезиты не корректны или недостаточный баланс' });
			this.shopService.setRequisites(authorizationData.id, bankType, requisites);

			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}
}

export const httpShopController = new HTTPShopController(shopService);