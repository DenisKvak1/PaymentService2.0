import * as express from 'express';
import { authorizationService } from '../modules/authorizationService';
import { requisitesValidator } from '../validators/RequisitesValidator';
import { ICardRequisites } from '../../../env/types';
import { bank } from '../modules/bank';
import { IShopService } from '../../core/services/interface/types';
import { shopValidator } from '../validators/ShopValidator';
import { shopService } from '../../core/services/ShopService';

export class HTTPShopController {

	constructor(
		private shopService: IShopService,
	) {}

	create(req: express.Request, res: express.Response){
		try {
			const {name} = req.body;

			const resultValidate = shopValidator.nameValidate(name)

			if(!resultValidate.valid) return res.json({status: "error", errorText: resultValidate.errors.join(" ")});

			const shop = this.shopService.create({name})
			const token = authorizationService.createToken({id: shop.id})
			res.json({status: 'ok', jwt: token});
		} catch(e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}

	async setRequisites(req: express.Request, res: express.Response){
		try {
			const {bankType, requisites} = req.body;
			const authorizationData = authorizationService.getData(req.headers['authorization']);

			const banks = {
				myBank: async (requisite: ICardRequisites)=>{
					const connection = bank.getBankConnectionByName("myBank")
					return await requisitesValidator.validateCardRequisites(connection, requisite)
				}
			}

			const isValid = await banks[bankType](requisites)
			if(!isValid) return res.json({status: "Error", errorText: "Реквезиты не корректны"})
			this.shopService.setRequisites(authorizationData.id, bankType, requisites)

			res.json({status: "ok"})
		} catch(e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}
}
export const httpShopController = new HTTPShopController(shopService)