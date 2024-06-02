export class TransactionValidator {
	metaValidate(meta: any): boolean {
		if (typeof meta !== 'object') return false;
		if (!meta.name) return false;
		if (!meta.description) return false;
		if (typeof meta.name !== 'string') return false;
		if (typeof meta.description !== 'string') return false;

		const resultNicknameValidate = this.metaNameValidate(meta.name);
		const resultDescriptionValidate = this.metaDescriptionValidate(meta.description);

		if (!resultNicknameValidate) return false;
		if (!resultDescriptionValidate) return false;

		return true;
	}

	private metaNameValidate(name: string) {
		const minLength = 3;
		const maxLength = 16;

		const validCharacters = /^[a-zA-Z0-9_-]+$/;

		const isLengthValid = name.length >= minLength && name.length <= maxLength;
		const hasValidCharacters = validCharacters.test(name);
		const noLeadingOrTrailingSpaces = !name.startsWith(' ') && !name.endsWith(' ');

		return isLengthValid && hasValidCharacters && noLeadingOrTrailingSpaces;
	}

	private metaDescriptionValidate(description: string) {
		const minLength = 10;
		const maxLength = 300;

		const isLengthValid = description.length >= minLength && description.length <= maxLength;

		const forbiddenCharacters = /[^a-zA-Z0-9 .,!?'"()-]/;
		const hasValidCharacters = !forbiddenCharacters.test(description);

		return isLengthValid && hasValidCharacters;
	}
}
export const transactionValidator = new TransactionValidator()