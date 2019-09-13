import {RequestHandler} from 'express'
import {successResponse} from '../../utils/apiResponse'
import * as services from './team.service'

/**
 * Get categories
 *
 * @param req
 * @param res
 */
export const getCategories: RequestHandler = async (req, res, next) => {
	const {id} = req.params
	const {type} = req.query
	try {
		const categories = await services.getCategories(id, type)
		return res.json(successResponse(categories))
	} catch (error) {
		next(error)
	}
}

/**
 * Create a category
 *
 * @param req
 * @param res
 */
export const createCategory: RequestHandler = async (req, res, next) => {
	try {
		const {id} = req.params
		const categoryData = {
			...req.body,
			team: id,
		}
		const newCategory = await services.createCategory(categoryData, req.user)
		return res.json(successResponse(newCategory, true))
	} catch (error) {
		next(error)
	}
}

export const deleteCategory: RequestHandler = async (req, res, next) => {
	try {
		const {team, category, user} = req

		const deletedCategory = await services.deleteCategory(team, category, user)
		return res.json(successResponse(deletedCategory, true))
	} catch (error) {
		next(error)
	}
}
