import UserModel, {UserDocument} from './user.model'
import {User} from './user.interface'
import createLogger from '../../utils/logger'
import apiError, {ErrorCode} from '../../utils/apiError'
import * as _ from 'lodash'
import {Sort} from '../../middlewares/validator'
import TeamModel, {TeamDocument} from '../team/team.model'
import {TeamInput} from '../team/team.interface'
import {slugify} from '../../utils/util'

const logger = createLogger(module)

const excludeFields = '-passport'

interface PaginationRecords<T> {
	total: number
	count: number
	records: T[]
}

/**
 * Find user by id
 *
 * @param id
 */
export const getUserById = async (id: string): Promise<UserDocument> => {
	const user = await UserModel.findById(id)
		.select(excludeFields)
		.exec()

	if (!user) {
		return Promise.reject(apiError.notFound('Cannot find user with that id'))
	}

	return Promise.resolve(user)
}

/**
 * Find many users with condition
 *
 */
export const getMany = async ({
	field = '',
	sort = Sort.asc,
	search = '',
	offset = 0,
	limit = 20,
}): Promise<PaginationRecords<UserDocument>> => {
	const query = UserModel.find().select(excludeFields)

	if (field) {
		query.sort({[field]: sort})
	}

	query
		.skip(offset)
		.limit(limit)
		.lean()

	if (search) {
		const searchRegex = new RegExp(`^${search}`, 'i')

		query.or([
			{firstName: {$regex: searchRegex, $options: 'i'}},
			{lastName: {$regex: searchRegex, $options: 'i'}},
			{email: {$regex: searchRegex, $options: 'i'}},
		])
	}

	const CountQuery = query.toConstructor()
	const countQuery = new CountQuery()

	const [records, count, total] = await Promise.all([
		query.exec(),
		countQuery.countDocuments().exec(),
		UserModel.countDocuments(),
	])

	return Promise.resolve({count, total, records})
}

/**
 * Update user
 *
 * @param id
 * @param userUpdate
 */
export const updateOne = async (
	id: string,
	userUpdate: User,
): Promise<UserDocument> => {
	logger.debug(`Update user: %o`, userUpdate)

	const user = await UserModel.findById(id).exec()

	if (!user) {
		return Promise.reject(apiError.notFound('Cannot find user with that id'))
	}

	_.merge(user, userUpdate)

	const updatedUser = await user.save()

	return Promise.resolve(updatedUser)
}

/**
 * Delete an user
 *
 * @param id
 */
export const deleteOne = async (id: string): Promise<UserDocument> => {
	const removedUser = await UserModel.findByIdAndDelete(id)
		.select(excludeFields)
		.exec()

	if (!removedUser) {
		return Promise.reject(apiError.notFound('Cannot find user with that id'))
	}

	return Promise.resolve(removedUser)
}

/**
 * Get user's own teams
 *
 * @param userId
 */
export const getMyTeams = async (userId: string): Promise<[TeamDocument]> => {
	logger.debug(`Get teams by user id: %o`, userId)

	const user = await UserModel.findById(userId)
		.populate('teams')
		.lean()
		.exec()

	return Promise.resolve(user.teams)
}

/**
 * Get user's team by slug
 *
 * @param slug
 * @param user
 */
export const getTeamBySlug = async (
	slug: string,
	user: User,
): Promise<TeamDocument> => {
	logger.debug(`Get teams by slug: %o`, slug)

	const team = await TeamModel.findOne({slug}).exec()
	if (!team) {
		return Promise.reject(apiError.notFound('Cannot find team with that slug'))
	}

	if (!user.teams.includes(team.id)) {
		return Promise.reject(
			apiError.forbidden(
				'User does not belong to this team',
				ErrorCode.notATeamMember,
			),
		)
	}

	return Promise.resolve(team)
}

/**
 * Create new team
 *
 * @param teamData
 * @param userId
 */
export const createTeam = async (
	teamData: TeamInput,
): Promise<TeamDocument> => {
	logger.debug(`Create new team: %o`, teamData)

	const createdTeams = await TeamModel.find({creator: teamData.creator})
		.select('name')
		.exec()
	if (createdTeams.some(team => team.name === teamData.name)) {
		return Promise.reject(
			apiError.badRequest(
				'There is already a team has similar name created by this user',
				ErrorCode.duplicatedTeamName,
			),
		)
	}

	const newTeam = await TeamModel.create({
		...teamData,
		slug: slugify(teamData.name),
	})

	// Save team id to user object
	const user = await UserModel.findById(teamData.creator)
	user.teams.push(newTeam.id)
	await user.save()

	return Promise.resolve(newTeam)
}
