import * as express from 'express';
import { authorizationService } from '../modules/authorizationService';
import { shopUseCases, ShopUseCases } from '../../core/useCases/shopUseCases';
import { IShopUseCases } from '../../core/useCases/interfaces/shop';

export class HTTPShopController {

	constructor(
		private shopUseCases: IShopUseCases,
	) {
	}

	create(req: express.Request, res: express.Response) {
		try {
			const { name } = req.body;

			const shopDoInfo = this.shopUseCases.create({ name });
			if(!shopDoInfo.success){
				return res.json({status: 'error', errorText: shopDoInfo.error});
			}

			const token = authorizationService.createToken({ id: shopDoInfo.data.id });
			res.json({ status: 'ok', jwt: token });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async setRequisites(req: express.Request, res: express.Response) {
		try {
			const { bankType, requisites } = req.body;
			const authorizationData = authorizationService.getData(req.headers['authorization']);

			const shopDoInfo = await this.shopUseCases.setRequisites(authorizationData.id, bankType, requisites);
			if(!shopDoInfo.success){
				return res.json({status: 'error', errorText: shopDoInfo.error});
			}

			res.json({ status: 'ok' });
		} catch (e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}
}

export const httpShopController = new HTTPShopController(shopUseCases);