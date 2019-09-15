import {RequestHandler, RequestParamHandler} from 'express'
import {successResponse} from '../../utils/apiResponse'
import * as services from './team.service'
import {CategoryInput} from '../category/category.interface'

export const parseTeamIdParam: RequestParamHandler = (req, res, next, id) => {
	services
		.parseTeamIdParam(id)
		.then(team => {
			req.team = team
			return next()
		})
		.catch(next)
}

export const parseCategoryIdParam: RequestParamHandler = (
	req,
	res,
	next,
	id,
) => {
	services
		.parseCategoryIdParam(id)
		.then(category => {
			req.category = category
			return next()
		})
		.catch(next)
}

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
		const {category} = req

		const deletedCategory = await services.deleteCategory(category)
		return res.json(successResponse(deletedCategory, true))
	} catch (error) {
		next(error)
	}
}

export const updateCategory: RequestHandler = (req, res, next) => {
	const {body, category} = req
	const {name, description, type} = body
	const categoryUpdate: CategoryInput = {name, description, type}

	services
		.updateCategory(category, categoryUpdate)
		.then(updatedCategory => {
			return res.json(successResponse(updatedCategory, true))
		})
		.catch(next)
}
