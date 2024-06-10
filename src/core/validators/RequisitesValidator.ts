import { ICardRequisites, IConnection } from '../../../env/types';
import { luhnCheck } from '../../../env/helpers/luhnCheck';
import { stringCardToDateObject } from '../../../env/helpers/stringCardDateToObject';

export class RequisitesValidator {
	async validateCardRequisites(requisites: ICardRequisites) {
		const errors: string[] = [];

		if (stringCardToDateObject(requisites.date).getTime() < Date.now()) errors.push('Карта просроченна');
		if (requisites.cvv2 < 100 || requisites.cvv2 > 999) errors.push('Данные cvv2 не валидны');
		if (!luhnCheck(requisites.number.toString())) errors.push('Данные карты не валидны');

		return {
			valid: errors.length === 0,
			errors: errors,
		};
	}
}

export const requisitesValidator = new RequisitesValidator();