export function formatDate(format: string, date: Date): string {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	return format
		.replace(/yyyy/g, year.toString())
		.replace(/MM/g, month.toString().padStart(2, "0"))
		.replace(/dd/g, day.toString().padStart(2, "0"))
		.replace(/HH/g, hours.toString().padStart(2, "0"))
		.replace(/mm/g, minutes.toString().padStart(2, "0"))
		.replace(/ss/g, seconds.toString().padStart(2, "0"));
}
