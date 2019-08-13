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
		const userId = req.user.id
		const newTeam = {...req.body, creator: userId}
		const team = await services.createOne(newTeam)
		return res.json(successResponse(team, true))
	} catch (error) {
		next(error)
	}
}
