import { TransactionSTATE, TransactionSTATEClass } from '../interface/types';
import { SELECT_BANK_STATE } from './SelectBankState';
import { WAITING_CONFIRMATION_STATE } from './WaitingConfirmation';
import { DELETED_STATE } from './DeletedState';
import { ICardRequisites, IConnection } from '../../../../env/types';
import { FINISHED_REJECT_STATE } from './FineshedReject';
import { config } from '../../../../env/config';

export class WAITING_FOR_REQUISITES_STATE extends TransactionSTATEClass {
	backToSelectBank(): void {
		this.transaction.state = new SELECT_BANK_STATE(this.transaction);
	}

	cancelTransaction(): void {
		this.transaction.state = new FINISHED_REJECT_STATE(this.transaction)
	}

	async confirmPayment(requisites: ICardRequisites): Promise<boolean> {
		const debitID = await this.transaction.bank.debitRequest(requisites, this.transaction.shop.requisites[this.transaction.bank.getName()].number, this.transaction.sum);
		if (!debitID) return false;

		const subscribe = this.transaction.bank.subscribeOnDebitResponse(debitID, (success) => {
			if(success){
				this.transaction.confirmTransaction()
			} else {
				this.transaction.cancelTransaction()
			}
			setTimeout(()=>{
				this.transaction.destroy()
			}, config.TIMEOUT_DELETE)
		});
		setTimeout(()=>{
			if(this.transaction.state.getName() !== TransactionSTATE.FINISHED_SUCCESS_STATE && this.transaction.state.getName() !== TransactionSTATE.DELETED_STATE && this.transaction.state.getName() !== TransactionSTATE.FINISHED_REJECT_STATE){
				subscribe.unsubscribe()
				this.transaction.cancelTransaction()
				this.transaction.destroy()
			}
		}, config.TIMEOUT_EXPIRED)
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

	async selectBank(connection: IConnection): Promise<boolean> {
		return false
	}
}