import mongoose, {Document, Schema} from 'mongoose'
import ExpenseItem from './expenseItem.interface'

export interface ExpenseItemDocument extends Document, ExpenseItem {}

const expenseItemSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	note: {
		type: String,
	},
	quantity: {
		type: Number,
		min: 1,
		default: 1,
		required: true,
	},
	price: {
		type: Number,
		min: 0,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
		required: true,
	},
	category: {
		required: true,
		type: Schema.Types.ObjectId,
		ref: 'category',
	},
	team: {
		required: true,
		type: Schema.Types.ObjectId,
		ref: 'team',
	},
	creator: {
		required: true,
		type: Schema.Types.ObjectId,
		ref: 'user',
	},
})

const expenseItemModel = mongoose.model<ExpenseItemDocument>(
	'expenseItem',
	expenseItemSchema,
)

export default expenseItemModel
