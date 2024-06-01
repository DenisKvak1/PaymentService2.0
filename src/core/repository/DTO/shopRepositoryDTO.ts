import { IRequisites } from '../../../../env/types';

export type CreateShopDTO = {
	name: string
	requisites?: IRequisites
}
export type UpdateShopDTO = {
	name?: string
	requisites?: IRequisites
}