import { ICardRequisites, IConnection } from '../../../env/types';

export class RequisitesValidator {
	async validateCardRequisites(connection: IConnection, requisites: ICardRequisites){
		if (Date.parse(requisites.date) < Date.now()) return false;
		if(requisites.cvv2 >= 100 && requisites.cvv2 <= 999) return false
		if(luhnCheck(requisites.number.toString())) return false

		return await connection.isValidRequisites(requisites)
	}
}
export const requisitesValidator = new RequisitesValidator()