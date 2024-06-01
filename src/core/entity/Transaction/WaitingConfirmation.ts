import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { FINISHED_STATE } from './Fineshed';
import { ICardRequisites, IConnection } from '../../../../env/types';

export class WAITING_CONFIRMATION_STATE extends TransactionSTATEClass {
	confirmTransaction(): void {
		this.transaction.state = new FINISHED_STATE(this.transaction);
	}

	getName(): TransactionSTATE {
		return TransactionSTATE.WAITING_CONFIRMATION_STATE;
	}

	backToSelectBank(): void {
	}

	cancelTransaction(): void {
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean | void> {
	}

	destroy(): void {
	}


	goToRequisites(): void {
	}

	selectBank(connection: IConnection): void {
	}
}