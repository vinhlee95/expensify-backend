import {RequestHandler} from 'express'
import * as services from './user.service'
import {successResponse} from '../../utils/apiResponse'

/**
 * Get me
 *
 * @param req
 * @param res
 */
export const getMe: RequestHandler = (req, res) => {
	return res.json(successResponse(req.user))
}

/**
 * Update me
 *
 * @param req
 * @param res
 */
export const updateMe: RequestHandler = async (req, res, next) => {
	try {
		const {body} = req
		const {id} = req.user

		const updatedUser = await services.updateOne(id, body)

		return res.json(successResponse(updatedUser, true))
	} catch (e) {
		return next(e)
	}
}

/**
 * Get users
 *
 * @param req
 * @param res
 * @param next
 */
export const getMany: RequestHandler = async (req, res, next) => {
	try {
		const {field, sort, search, offset, limit} = req.query

		const userPaginationRecords = await services.getMany({
			field,
			sort,
			search,
			offset,
			limit,
		})

		return res.json(successResponse(userPaginationRecords))
	} catch (e) {
		return next(e)
	}
}

/**
 * Get user by id
 *
 * @param req
 * @param res
 */
export const getOne: RequestHandler = async (req, res, next) => {
	try {
		const id = req.params.id

		const user = await services.getUserById(id)

		return res.json(successResponse(user))
	} catch (e) {
		return next(e)
	}
}

/**
 * Update user with id
 *
 * @param req
 * @param res
 */
export const updateOne: RequestHandler = async (req, res, next) => {
	try {
		const {body} = req
		const {id} = req.params

		const updatedUser = await services.updateOne(id, body)

		return res.json(successResponse(updatedUser, true))
	} catch (e) {
		return next(e)
	}
}

/**
 * Delete user with id
 *
 * @param req
 * @param res
 */
export const deleteOne: RequestHandler = async (req, res, next) => {
	try {
		const id = req.params.id

		const removedUser = await services.deleteOne(id)

		return res.json(successResponse(removedUser, true))
	} catch (e) {
		return next(e)
	}
}

/**
 * Get my teams
 *
 * @param req
 * @param res
 */
export const getMyTeams: RequestHandler = async (req, res, next) => {
	try {
		const {_id} = req.user
		const teams = await services.getMyTeams(_id)
		return res.json(successResponse(teams))
	} catch (error) {
		next(error)
	}
}

/**
 * Get user team by slug
 *
 * @param req
 * @param res
 */
export const getTeamBySlug: RequestHandler = async (req, res, next) => {
	try {
		const {slug} = req.params
		const {user} = req

		const team = await services.getTeamBySlug(slug, user)
		return res.json(successResponse(team))
	} catch (error) {
		next(error)
	}
}

/**
 * Create a team
 *
 * @param req
 * @param res
 */
export const createTeam: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user.id
		const newTeam = {...req.body, creator: userId}
		const team = await services.createTeam(newTeam)
		return res.json(successResponse(team, true))
	} catch (error) {
		next(error)
	}
}
