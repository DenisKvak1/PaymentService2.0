export function stringCardToDateObject(dateStr: string): Date {
	const [month, year] = dateStr.split('/');

	const dateObj = new Date();
	const currentYear = new Date().getFullYear();
	const currentCentury = Math.floor(currentYear / 100);
	const twoDigitYear = parseInt(year, 10);

	const fullYear = currentCentury * 100 + twoDigitYear;

	dateObj.setFullYear(fullYear);
	dateObj.setMonth(parseInt(month, 10) - 1);
	dateObj.setDate(1);

	return dateObj;
}
