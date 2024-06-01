import { myBankConnection } from '../bankConnections/MyBankConnection';
import { IConnection } from '../../../env/types';

export class Bank {
	getBankConnectionByName(name: string): IConnection | undefined {
		switch (name) {
			case 'myBank':
				return myBankConnection;
			default:
				return undefined;
		}
	}
}

export const bank = new Bank();