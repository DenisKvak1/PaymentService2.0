import { ICardRequisites, IConnection } from '../../../env/types';
import axios from 'axios';

export class MyBankConnection implements IConnection {
	getName(): string {
		return 'myBank';
	}

	async debitRequest(requisites: ICardRequisites, receiverAddress: string | number, sum: number): Promise<number | undefined> {
		const response = await axios.post('127.0.0.1:3000/card/debitRequest', {
			debitData: {
				destinationNumber: requisites.number,
				cvv2: requisites.cvv2,
				date: requisites.date,
				receiverNumber: receiverAddress,
				sum,
			},
		});
		return response.data.debitRequestID;
	}

	async isValidRequisites(requisites: ICardRequisites): Promise<boolean> {
		const response = await axios.post('127.0.0.1:3000/card/debitRequest', {
			requisites: {
				number: requisites.number,
				cvv2: requisites.cvv2,
				date: requisites.date,
			},
		});
		return response.data.isValid;
	}

	subscribeOnDebitResponse(id: number, callback: (response: boolean) => void): void {
		const interval = setInterval(async () => {
			const resp = await axios.get(`127.0.0.1:3000/card/getDebitStatus/${id}`);
			if (!resp.data.finished) return;
			callback(resp.data.finished);
			clearInterval(interval);
		}, 10000);
	}
}

export const myBankConnection = new MyBankConnection();