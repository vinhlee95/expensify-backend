import {Category} from '../category/category.interface'
import {CategoryDocument} from '../category/category.model'

export default interface Item {
	date: Date
	name: string
	note?: string
	quantity: number
	price: number
	total?: number
	category: string
	team: string
	creator: string
}

export interface ItemInput {
	date: Date
	name: string
	note?: string
	quantity: number
	price: number
	category: string
}
