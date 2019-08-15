export enum CategoryType {
	Expense = 'expense',
	Income = 'income',
}

export interface Category {
	name: string
	description?: string
	type: CategoryType
	teamId: string
}
