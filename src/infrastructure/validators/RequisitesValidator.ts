import { ICardRequisites, IConnection } from '../../../env/types';
import { luhnCheck } from '../../../env/helpers/luhnCheck';
import { stringCardToDateObject } from '../../../env/helpers/stringCardDateToObject';

export class RequisitesValidator {
	async validateCardRequisites(connection: IConnection, requisites: ICardRequisites){
		if (stringCardToDateObject(requisites.date).getTime() < Date.now()) return false;
		if(requisites.cvv2 < 100 || requisites.cvv2 > 999) return false
		if(!luhnCheck(requisites.number.toString())) return false

		return await connection.isValidRequisites(requisites)
	}
}
export const requisitesValidator = new RequisitesValidator()