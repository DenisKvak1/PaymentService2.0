import * as express from 'express';
import { authorizationService } from '../modules/authorizationService';
import { requisitesValidator } from '../validators/RequisitesValidator';
import { ICardRequisites } from '../../../env/types';
import { bank } from '../modules/bank';
import { IShopService } from '../../core/services/interface/types';

export class HTTPShopController {

	constructor(
		private shopService: IShopService,
	) {}

	create(req: express.Request, res: express.Response){
		try {
			const {name} = req.body;

			// TODO Validate name

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
			const isValid = bank[bankType](requisites)
			if(!isValid) res.json({status: "Error", errorText: "Реквезиты не корректны"})
			this.shopService.setRequisites(authorizationData.id, bankType, requisites)

			res.json({status: "ok"})
		} catch(e) {
			res.json({ status: 'error', errorText: e.message });
		}
	}
}