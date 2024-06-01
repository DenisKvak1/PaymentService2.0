import jwt from 'jsonwebtoken';
import { authorizationData } from '../../../env/types';

export class AuthorizationService {
	constructor(private readonly verificationCode: string) {}

	createToken(data: {[key:string]: any}): string | null {
		return jwt.sign(data, this.verificationCode);
	};

	verify(token: string): boolean {
		try {
			return Boolean(jwt.verify(token, this.verificationCode));
		} catch (e){
			return false
		}
	};

	getData(token: string): authorizationData {
		return jwt.verify(token, this.verificationCode) as authorizationData;
	};
}
export const authorizationService = new AuthorizationService(process.env.VERIFICATION_CODE);