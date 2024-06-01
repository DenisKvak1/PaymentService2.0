import { ITransaction, TransactionInfo, TransactionSTATEClass } from '../interface/types';
import { SELECT_BANK_STATE } from './SelectBankState';
import { ICardRequisites, IConnection, IShop, Meta } from '../../../../env/types';

export class Transaction implements ITransaction {
	id: string;
	bank: IConnection;
	meta: Meta;
	shop: IShop;
	state: TransactionSTATEClass;
	sum: number;

	constructor(id: string, shop: IShop, meta: Meta, sum: number) {
		this.id = id;
		this.meta = meta;
		this.sum = sum;
		this.shop = shop;

		this.state = new SELECT_BANK_STATE(this);
	}

	destroy(): void {
		this.state.destroy();
	}

	backToSelectBank(): void {
		this.state.backToSelectBank();
	}

	cancelTransaction(): void {
		this.state.cancelTransaction();
	}

	confirmPayment(requisites: ICardRequisites): void {
		this.state.confirmPayment(requisites);
	}

	confirmTransaction(): void {
		this.state.confirmTransaction();
	}


	goToRequisites(): void {
		this.state.goToRequisites();
	}

	selectBank(connection: IConnection): void {
		this.state.selectBank(connection);
	}

	getAvailableBanks(): string[] {
		const availableBanks: string[] = [];
		for (const key in this.shop.requisites) {
			if (this.shop.requisites[key]) availableBanks.push(key);
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