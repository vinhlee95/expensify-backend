export default interface ExpenseItem {
	date: Date
	name: string
	note?: string
	quantity: number
	price: number
	category: string
	team: string
	creator: string
}
