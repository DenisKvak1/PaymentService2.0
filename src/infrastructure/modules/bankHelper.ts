import { myBankConnection } from '../bankConnections/MyBankConnection';
import { IConnection } from '../../../env/types';

export class BankHelper {
	getBankConnectionByName(name: string): IConnection | undefined {
		switch (name) {
			case 'myBank':
				return myBankConnection;
			default:
				return undefined;
		}
	}
}

export const bankHelper = new BankHelper();