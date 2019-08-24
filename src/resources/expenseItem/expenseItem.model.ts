import mongoose, {Document, Schema} from 'mongoose'
import ExpenseItem from './expenseItem.interface'

export interface ExpenseItemDocument extends Document, ExpenseItem {}

const expenseItemSchema = new Schema({
	date: {
		type: Date,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	note: {
		type: String,
	},
	quantity: {
		type: Number,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	category: {
		type: Schema.Types.ObjectId,
		ref: 'category',
	},
	team: {
		type: Schema.Types.ObjectId,
		ref: 'team',
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'user',
	},
})

const expenseItemModel = mongoose.model<ExpenseItemDocument>(
	'expenseItem',
	expenseItemSchema,
)

export default expenseItemModel
