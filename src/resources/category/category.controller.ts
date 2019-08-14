import {RequestHandler} from 'express-serve-static-core'
import * as services from './category.service'
import {successResponse} from '../../utils/apiResponse'

/**
 * Get many
 *
 * @param req
 * @param res
 */
export const getMany: RequestHandler = async (req, res, next) => {
	const {teamId, type} = req.query
	try {
		const categories = await services.getMany(type, teamId)
		return res.json(successResponse(categories))
	} catch (error) {
		next(error)
	}
}
