import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { SELECT_BANK_STATE } from './SelectBankState';
import { WAITING_CONFIRMATION_STATE } from './WaitingConfirmation';
import { DELETED_STATE } from './DeletedState';
import { ICardRequisites, IConnection } from '../../../../env/types';

export class WAITING_FOR_REQUISITES_STATE extends TransactionSTATEClass {
	backToSelectBank(): void {
		this.transaction.state = new SELECT_BANK_STATE(this.transaction);
	}

	cancelTransaction(): void {
		this.transaction.state = new DELETED_STATE(this.transaction);
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean | void> {
		if (!await this.transaction.bank.isValidRequisites(requisites)) return false;
		const debitID = await this.transaction.bank.debitRequest(requisites, this.transaction.shop.requisites[this.transaction.bank.getName()], this.transaction.sum);
		if (!debitID) return false;
		this.transaction.bank.subscribeOnDebitResponse(debitID, () => this.transaction.confirmTransaction());
		this.transaction.state = new WAITING_CONFIRMATION_STATE(this.transaction);
		return true;
	}

	getName(): TransactionSTATE {
		return TransactionSTATE.WAITING_FOR_REQUISITES_STATE;
	}

	confirmTransaction(): void {
	}

	destroy(): void {
	}

	goToRequisites(): void {
	}

	selectBank(connection: IConnection): void {
	}
}