import mongoose, {Document, Schema} from 'mongoose'
import Item from './item.interface'
export interface ItemDocument extends Document, Item {}

const itemSchema = new Schema({
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
	total: {
		type: Number,
		required: true,
		default: 0,
	},
	date: {
		type: Date,
		default: Date.now(),
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

itemSchema.pre<ItemDocument>('save', function(next) {
	if (!this.isModified('price') || !this.isModified('quantity')) {
		return next()
	}

	this.total = this.price * this.quantity

	return next()
})

const itemModel = mongoose.model<ItemDocument>('item', itemSchema)

export default itemModel
