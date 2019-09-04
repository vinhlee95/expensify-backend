import {RequestHandler} from 'express'
import {successResponse} from '../../utils/apiResponse'
import * as services from './team.service'

export const getCategories: RequestHandler = async (req, res, next) => {
	const {id} = req.params
	const {type} = req.query
	try {
		const categories = await services.getCategories(type, id)
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

export const createExpenseItem: RequestHandler = async (req, res, next) => {
	try {
		const {id} = req.params
		const expenseItem = {
			...req.body,
			team: id,
		}
		const newExpenseItem = await services.createExpenseItem(
			req.user,
			expenseItem,
		)
		return res.json(successResponse(newExpenseItem, true))
	} catch (error) {
		next(error)
	}
}

export const getExpenseItems: RequestHandler = async (req, res, next) => {
	const {id} = req.params
	const {offset, limit} = req.query

	try {
		const expenseItems = await services.getExpenseItems(id, {
			offset,
			limit,
		})
		return res.json(successResponse(expenseItems))
	} catch (error) {
		next(error)
	}
}
