import {body, param} from 'express-validator/check'
import {handleValidationError} from '../../middlewares/validator'

export const validateCreateTeam = () => {
	return [
		body('name', 'Name must be a string').isString(),
		body('description', 'Description must be a string')
			.optional()
			.isString(),
		handleValidationError,
	]
}

export const validateGetTeamBySlug = () => {
	return [
		param('slug', 'Slug must be a string').isString(),
		handleValidationError,
	]
}
