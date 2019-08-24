import {body, query} from 'express-validator/check'
import {handleValidationError} from '../../middlewares/validator'
import {CategoryType} from '../category/category.interface'
import {enumToValues} from '../../utils/util'

export const validateGetCategories = () => {
	return [
		query('type', 'Invalid category type')
			.optional()
			.isIn(enumToValues(CategoryType)),
		handleValidationError,
	]
}

export const validateCreateCategory = () => {
	return [
		body('name', 'Name must be a string').isString(),
		body('description', 'Description must be a string')
			.optional()
			.isString(),
		body('type', 'Invalid category type').isIn(enumToValues(CategoryType)),
		handleValidationError,
	]
}
