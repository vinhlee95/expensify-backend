import {RequestHandler} from 'express'
import {successResponse} from '../../utils/apiResponse'
import * as services from './team.service'

/**
 * Create one
 *
 * @param req
 * @param res
 */
export const createOne: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user._id
		const team = await services.createOne(req.body, userId)
		return res.json(successResponse(team, true))
	} catch (error) {
		next(error)
	}
}

/**
 * Get by user id
 *
 * @param req
 * @param res
 */
export const getByUserId: RequestHandler = async (req, res, next) => {
	try {
		const {userId} = req.query
		const data = await services.getByUserId(userId)
		return res.json(successResponse(data.teams))
	} catch (error) {
		next(error)
	}
}
