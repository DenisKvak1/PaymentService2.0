import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { FINISHED_REJECT_STATE } from './FineshedReject';
import { ICardRequisites, IConnection } from '../../../../env/types';
import { DELETED_STATE } from './DeletedState';
import { FINISHED_SUCCESS_STATE } from './FinishedAccept';

export class WAITING_CONFIRMATION_STATE extends TransactionSTATEClass {
	confirmTransaction(): void {
		this.transaction.state = new FINISHED_SUCCESS_STATE(this.transaction);
	}

	getName(): TransactionSTATE {
		return TransactionSTATE.WAITING_CONFIRMATION_STATE;
	}

	backToSelectBank(): void {
	}

	cancelTransaction(): void {
		this.transaction.state = new FINISHED_REJECT_STATE(this.transaction)
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean> {
		return false
	}

	destroy(): void {
	}


	goToRequisites(): void {
	}

	async selectBank(connection: IConnection): Promise<boolean> {
		return false
	}

}