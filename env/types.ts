export type IConnection = {
	isValidRequisites(requisites: ICardRequisites): Promise<boolean>
	debitRequest(requisites: ICardRequisites, receiverAddress: string | number, sum: number): Promise<number | undefined>
	subscribeOnDebitResponse(requestID: number, callback: (response: boolean) => void): void
	getName(): string
}
export type Meta = {
	name: string
	description: string
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