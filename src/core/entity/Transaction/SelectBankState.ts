import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { WAITING_FOR_REQUISITES_STATE } from './WaitingForRequisites';
import { DELETED_STATE } from './DeletedState';
import { ICardRequisites, IConnection } from '../../../../env/types';

export class SELECT_BANK_STATE extends TransactionSTATEClass {


	cancelTransaction(): void {
		this.transaction.state = new DELETED_STATE(this.transaction);
	}


	goToRequisites(): void {
		if(!this.transaction.bank) return
		this.transaction.state = new WAITING_FOR_REQUISITES_STATE(this.transaction);
	}

	async selectBank(connection: IConnection): Promise<boolean> {
		const banks =  await this.transaction.getAvailableBanks()
		const includeBank = banks.includes(connection.getName())

		if(!includeBank) return false
		this.transaction.bank = connection;
		return true
	}

	getName(): TransactionSTATE {
		return TransactionSTATE.SELECT_BANK_STATE;
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean> {
		return false
	}

	confirmTransaction(): void {
	}

	destroy(): void {
	}

	backToSelectBank(): void {
	}
}