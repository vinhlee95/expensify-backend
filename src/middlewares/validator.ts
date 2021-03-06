import mongoose from 'mongoose'
import {RequestHandler} from 'express'
import {
	query,
	ErrorFormatter,
	validationResult,
	param,
} from 'express-validator/check'
import moment from 'moment'
import apiError from '../utils/apiError'
import {isISO8601} from 'validator'

export enum Sort {
	asc = 'asc',
	desc = 'desc',
}

/**
 * Middleware to validate common queries
 */
export const validateCommonQueries = () => {
	return [
		query('sort', 'Invalid sort query')
			.optional()
			.isIn([Sort.asc, Sort.desc]),
		query('offset', 'Invalid pagination offset, offset must be a number')
			.optional()
			.toInt()
			.isInt({min: 0}),
		query(
			'limit',
			'Invalid pagination limit, limit must be a number and greater than 0',
		)
			.optional()
			.toInt()
			.isInt({min: 1}),
		query('from', 'Invalid from date time')
			.optional()
			.isString()
			.custom(value => isISO8601(value)),
		query('to', 'Invalid to date time')
			.optional()
			.isString()
			.custom((value, {req}) => {
				const {from} = req.query
				console.log(moment(value).isAfter(moment(from)))
				return isISO8601(value) && moment(value).isAfter(moment(from))
			}),
		handleValidationError,
	]
}

const hasObjectIdType = (id: any) => mongoose.Types.ObjectId.isValid(id)
/**
 * Middleware to validate MongoDB id
 */
export const validateId = () => {
	return [
		query('userId', 'must be a hash string')
			.optional()
			.custom(value => {
				return hasObjectIdType(value)
			}),
		param('id', 'must be a hash string')
			.optional()
			.custom(value => {
				return hasObjectIdType(value)
			}),
		param('categoryId', 'must be a hash string')
			.optional()
			.custom(value => {
				return hasObjectIdType(value)
			}),
		handleValidationError,
	]
}

/**
 * Middleware to return validation createError from express-validator
 *
 * @param req
 * @param res
 * @param next
 */
export const handleValidationError: RequestHandler = (req, res, next) => {
	const errors = validationResult(req)

	const errorFormatter: ErrorFormatter<string> = ({msg}) => {
		return msg
	}

	if (!errors.isEmpty()) {
		const errorMessage = errors.formatWith(errorFormatter).array()[0] as string

		return next(apiError.badRequest(errorMessage))
	}

	return next()
}
