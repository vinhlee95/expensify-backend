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

export const deleteCategory: RequestHandler = (req, res, next) => {
	const {category} = req

	services
		.deleteCategory(category)
		.then(deletedCategory => res.json(successResponse(deletedCategory, false)))
		.catch(next)
}

export const updateCategory: RequestHandler = (req, res, next) => {
	const {body, category} = req
	const {name, description, type} = body
	const categoryUpdate: CategoryInput = {name, description, type}

	services
		.updateCategory(category, categoryUpdate)
		.then(updatedCategory => {
			return res.json(successResponse(updatedCategory, false))
		})
		.catch(next)
}

export const createItem: RequestHandler = (req, res, next) => {
	const {id} = req.params
	const item = {
		...req.body,
		creator: req.user,
		team: id,
	}

	const {date, name, note, quantity, price, category} = req.body

	const itemCreate = {
		date,
		name,
		note,
		quantity,
		price,
		category,
		creator: req.user,
		team: id,
	}

	services
		.createItem(req.user, itemCreate)
		.then(newItem => res.json(successResponse(newItem, true)))
		.catch(next)
}

export const getItems: RequestHandler = (req, res, next) => {
	const {id} = req.params
	const {offset, limit} = req.query

	services
		.getItems(id, {
			offset,
			limit,
		})
		.then(items => res.json(successResponse(items)))
		.catch(next)
}
