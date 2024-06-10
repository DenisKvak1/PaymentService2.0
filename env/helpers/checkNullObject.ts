export function checkNullObject(obj: any): boolean {
	for (const key in obj) {
		if(key === "null" || key === "undefined") return false
	}
	return true
}