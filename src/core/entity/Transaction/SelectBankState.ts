import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { WAITING_FOR_REQUISITES_STATE } from './WaitingForRequisites';
import { DELETED_STATE } from './DeletedState';
import { ICardRequisites, IConnection } from '../../../../env/types';

export class SELECT_BANK_STATE extends TransactionSTATEClass {


	cancelTransaction(): void {
		this.transaction.state = new DELETED_STATE(this.transaction);
	}


	goToRequisites(): void {
		this.transaction.state = new WAITING_FOR_REQUISITES_STATE(this.transaction);
	}

	selectBank(connection: IConnection): void {
		this.transaction.bank = connection;
	}

	getName(): TransactionSTATE {
		return TransactionSTATE.SELECT_BANK_STATE;
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean | void> {
	}

	confirmTransaction(): void {
	}

	destroy(): void {
	}

	backToSelectBank(): void {
	}
}