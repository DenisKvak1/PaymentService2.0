import { ITransaction, TransactionInfo, TransactionSTATEClass } from '../interface/types';
import { SELECT_BANK_STATE } from './SelectBankState';
import { ICardRequisites, IConnection, iObservable, IShop, Meta } from '../../../../env/types';
import { bankHelper } from '../../../infrastructure/modules/bankHelper';
import { Observable } from '../../../../env/helpers/observable';

export class Transaction implements ITransaction {
	id: string;
	bank: IConnection;
	meta: Meta;
	shop: IShop;
	state: TransactionSTATEClass;
	sum: number;
	delete$ = new Observable<null>()

	constructor(id: string, shop: IShop, meta: Meta, sum: number) {
		this.id = id;
		this.meta = meta;
		this.sum = sum;
		this.shop = shop;

		this.state = new SELECT_BANK_STATE(this);
	}

	destroy(): void {
		this.delete$.next()
		this.state.destroy();
	}

	backToSelectBank(): void {
		this.state.backToSelectBank();
	}

	cancelTransaction(): void {
		this.state.cancelTransaction();
	}

	confirmPayment(requisites: ICardRequisites): Promise<boolean> {
		return this.state.confirmPayment(requisites);
	}

	confirmTransaction(): void {
		this.state.confirmTransaction();
	}


	goToRequisites(): void {
		this.state.goToRequisites();
	}

	selectBank(connection: IConnection): Promise<boolean> {
		return this.state.selectBank(connection);
	}

	async getAvailableBanks(): Promise<string[]> {
		const availableBanks: string[] = [];
		for (const key in this.shop.requisites) {
			if (this.shop.requisites[key]) {
				const connection = bankHelper.getBankConnectionByName(key);
				if(!connection) continue
				const isPinged = await connection.ping();
				if (!isPinged) continue
				availableBanks.push(key);
			}
		}
		return availableBanks;
	}

	getInfo(): TransactionInfo {
		return {
			state: this.state.getName(),
			meta: this.meta,
			sum: this.sum,
		};
	}
}