import mongoose, {Document, Schema} from 'mongoose'
import {Category} from './category.interface'

export interface CategoryDocument extends Document, Category {}

const categorySchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	type: {
		type: String,
		required: true,
	},
	team: {
		type: mongoose.Types.ObjectId,
		ref: 'team',
		required: true,
	},
})

const CategoryModel = mongoose.model<CategoryDocument>(
	'category',
	categorySchema,
)

export default CategoryModel
