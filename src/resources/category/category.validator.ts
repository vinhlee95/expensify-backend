import {query} from 'express-validator/check'
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
