export class ShopValidator {
	nameValidate(nickname: string) {
		const errors: string[] = [];

		const minLength = 3;
		const maxLength = 16;

		if (nickname.length < minLength) {
			errors.push(`Никнейм должен содержать минимум ${minLength} символов.`);
		}

		if (nickname.length > maxLength) {
			errors.push(`Никнейм должен содержать максимум ${maxLength} символов.`);
		}

		const validCharacters = /^[a-zA-Z0-9_-]+$/;

		if (!validCharacters.test(nickname)) {
			errors.push('Никнейм может содержать только буквы, цифры, подчеркивания и тире.');
		}

		if (nickname.startsWith(' ') || nickname.endsWith(' ')) {
			errors.push('Никнейм не должен начинаться или заканчиваться пробелами.');
		}

		return {
			valid: errors.length === 0,
			errors: errors,
		};
	}
}
export const shopValidator = new ShopValidator()