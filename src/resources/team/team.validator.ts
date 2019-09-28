import {body, query} from 'express-validator/check'
import {handleValidationError} from '../../middlewares/validator'
import {CategoryType} from '../category/category.interface'
import {enumToValues} from '../../utils/util'
import {RequestHandler} from 'express'
import apiError, {ErrorCode} from '../../utils/apiError'
import TeamModel from './team.model'

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

export const validateCreateItem = () => {
	return [
		body('name', 'Name must be a string').isString(),
		body('note', 'Description must be a string')
			.optional()
			.isString(),
		body(
			'quantity',
			'Quantity must be a positive number larger than 1',
		).isFloat({min: 1}),
		body('price', 'Price must be a positive number').isFloat({min: 0}),
		handleValidationError,
	]
}

export const validateUpdateItem = () => {
	return [
		body('name', 'Name must be a string')
			.optional()
			.isString(),
		body('note', 'Description must be a string')
			.optional()
			.isString(),
		body('quantity', 'Quantity must be a positive number larger than 1')
			.optional()
			.isFloat({min: 1}),
		body('price', 'Price must be a positive number')
			.optional()
			.isFloat({min: 0}),
		handleValidationError,
	]
}

export const validateUpdateCategory = () => {
	return [
		body('name', 'Name must be a string')
			.optional()
			.isString(),
		body('description', 'Description must be a string')
			.optional()
			.isString(),
		body('type', 'Invalid category type')
			.optional()
			.isIn(enumToValues(CategoryType)),
		handleValidationError,
	]
}

export const validateGetTotalByCategory = () => {
	return [
		body('', 'Category ids must exist and be an array').isArray(),
		handleValidationError,
	]
}

export const checkTeamCreator: RequestHandler = (req, res, next) => {
	const {team, user} = req

	if (!team.creator.equals(user.id)) {
		return next(
			apiError.forbidden(
				'This user is not team creator',
				ErrorCode.notACreator,
			),
		)
	}

	return next()
}

export const checkBelongToTeam: RequestHandler = (req, res, next) => {
	const {id} = req.params
	const {user} = req

	if (!user.teams.includes(id)) {
		return next(
			apiError.forbidden(
				'This user does not belong to the team with that id',
				ErrorCode.notATeamMember,
			),
		)
	}

	return next()
}
