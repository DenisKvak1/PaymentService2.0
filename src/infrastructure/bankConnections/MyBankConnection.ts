import { ICardRequisites, IConnection, ISubscribe } from '../../../env/types';
import axios from 'axios';

export class MyBankConnection implements IConnection {
	getName(): string {
		return 'myBank';
	}

	async debitRequest(requisites: ICardRequisites, receiverAddress: string | number, sum: number): Promise<number | undefined> {
		const response = await axios.post('http://127.0.0.1:3001/card/debitRequest', {
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
		const response = await axios.post('http://127.0.0.1:3001/card/validateRequisites', {
			requisites: {
				number: requisites?.number,
				cvv2: requisites?.cvv2,
				date: requisites?.date,
			},
		});
		return response.data.isValid;
	}

	async checkExistingRequisites(requisites: string): Promise<boolean> {
		const response = await axios.post('http://127.0.0.1:3001/card/checkExist', {
			requisites: {
				number: requisites,
			},
		});
		return response.data.isValid;
	}

	async ping(): Promise<boolean> {
		try {
			await axios.get('http://127.0.0.1:3001');
			return true
		} catch (e){
			return false
		}
	}

	subscribeOnDebitResponse(id: number, callback: (response: boolean) => void): ISubscribe {
		const interval = setInterval(async () => {
			const resp = await axios.get(`http://127.0.0.1:3001/card/checkDebitStatus/${id}`);
			if (!resp.data.finished) return;

			callback(resp.data.success);
			clearInterval(interval);
		}, 10000);
		return { unsubscribe: () => clearInterval(interval) };
	}
}

export const myBankConnection = new MyBankConnection();