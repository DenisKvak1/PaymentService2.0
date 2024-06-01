function luhnCheck(cardNumber: string): boolean {
	const digits = cardNumber.split('').map(Number);
	digits.reverse();
	let sum = 0;

	for (let i = 0; i < digits.length; i++) {
		let digit = digits[i];

		if (i % 2 === 1) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}

		sum += digit;
	}

	return sum % 10 === 0;
}