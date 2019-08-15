import {query, body} from 'express-validator/check'
import {handleValidationError} from '../../middlewares/validator'
import {CategoryType} from './category.interface'
import {enumToValues} from '../../utils/util'

export const validateGetCategories = () => {
	return [
		query('type', 'Invalid category type').isIn(enumToValues(CategoryType)),
		query('teamId', 'team id must be a string').isString(),
		handleValidationError,
	]
}

export const validateCreateCategory = () => {
	return [
		body('name', 'Name must be a string').isString(),
		body('description', 'Description must be a string').optional().isString(),
		body('type', 'Invalid category type').isIn(enumToValues(CategoryType)),
		body('teamId', 'team id must be a string').isString(),
		handleValidationError,
	]
}