import { CreateShopDTO } from '../../repository/DTO/shopRepositoryDTO';
import { DoInfo } from '../../../../env/types';

export type IShopUseCases = {
	create(dto: CreateShopDTO): DoInfo
	delete(id: string): Promise<DoInfo>
	getByID(id: string): Promise<DoInfo>
	setName(id: string, name: string): Promise<DoInfo>
	setRequisites(id: string, bankType: string, requisites: number | string): Promise<DoInfo>
}