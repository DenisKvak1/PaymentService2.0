export class TransactionValidator {
	metaValidate(meta: any) {
		const errors: string[] = [];

		if (typeof meta !== 'object') return {valid: false, errors: ['Мета - не обьект']};
		if (!meta.name) return {valid: false, errors: ['Название не предоставленно']};
		if (!meta.description) return {valid: false, errors: ['Описание не предоставленно']};
		if (typeof meta.name !== 'string') return {valid: false, errors: ['Название - не строка']};
		if (typeof meta.description !== 'string') return {valid: false, errors: ['Описание не строка']};

		const resultNicknameValidate = this.metaNameValidate(meta.name);
		const resultDescriptionValidate = this.metaDescriptionValidate(meta.description);

		if (!resultNicknameValidate) errors.push('Никнем не валиден');
		if (!resultDescriptionValidate) errors.push('Описание не валидно');

		return {
			valid: errors.length === 0,
			errors: errors,
		};
	}

	private metaNameValidate(name: string) {
		const minLength = 3;
		const maxLength = 16;

		const validCharacters = /^[\p{L}\p{N}_-]+$/u;

		const isLengthValid = name.length >= minLength && name.length <= maxLength;
		const hasValidCharacters = validCharacters.test(name);
		const noLeadingOrTrailingSpaces = !name.startsWith(' ') && !name.endsWith(' ');

		return isLengthValid && hasValidCharacters && noLeadingOrTrailingSpaces;
	}

	private metaDescriptionValidate(description: string) {
		const minLength = 10;
		const maxLength = 300;

		const isLengthValid = description.length >= minLength && description.length <= maxLength;

		const forbiddenCharacters = /[^\p{L}\p{N} .,!?'"()-]/u;
		const hasValidCharacters = !forbiddenCharacters.test(description);

		return isLengthValid && hasValidCharacters;
	}
}
export const transactionValidator = new TransactionValidator()