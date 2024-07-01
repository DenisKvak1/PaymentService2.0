export type iSubscribe = { unsubscribe: () => void }
export type iObservable<T> = {
	subscribe: (callback: (eventData: T) => void) => iSubscribe;
	next: (eventData?: T) => void;
	unsubscribeAll: () => void;
	getValue: () => T;
	setValue: (value: T) => void;
	once: (callback: (eventData?: T) => void) => void;
	onceOr: (conditions: boolean, callback: (eventData?: T) => void) => void;
}
export type IConnection = {
	ping(): Promise<boolean>
	isValidRequisites(requisites: ICardRequisites): Promise<boolean>;
	debitRequest(requisites: ICardRequisites, receiverAddress: string | number, sum: number): Promise<number | undefined>
	checkExistingRequisites(requisites: string): Promise<boolean>;
	checkSufficientBalance(requisites: string, sum: number): Promise<boolean>;
	subscribeOnDebitResponse(requestID: number, callback: (response: boolean) => void): ISubscribe;
	getName(): string;
}
export type Meta = {
	name: string;
	description: string;
}
export type authorizationData = {
	id: string
}
export type ICardRequisites = {
	number: number
	date: string
	cvv2: number
}
export type IRequisites = {
	myBanK?: ICardRequisites
	[key: string]: any;
}
export type IShop = {
	name: string
	requisites: IRequisites
}
export type DoInfo = {
	success: boolean,
	error: string
	data?: any
}
export type bankInfo = {
	id: string;
	name: string;
	image: string;
	isAvailable: boolean;
};

export type ISubscribe = { unsubscribe: () => void }