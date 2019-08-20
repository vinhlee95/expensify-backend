import TeamModel, {TeamDocument} from './team.model'
import {TeamInput} from './team.interface'
import UserModel from '../user/user.model'

// Utils
import createLogger from '../../utils/logger'
import {slugify} from '../../utils/util'
import CategoryModel, {CategoryDocument} from '../category/category.model'
import {Category} from '../category/category.interface'
import {User} from '../user/user.interface'
import apiError, {ErrorCode} from '../../utils/apiError'

const logger = createLogger(module)

/**
 * Create new team
 *
 * @param teamData
 * @param userId
 */
export const createOne = async (teamData: TeamInput): Promise<TeamDocument> => {
	logger.debug(`Create new team: %o`, teamData)

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

/**
 * Get all categories
 *
 * @param type
 * @param teamId
 */
export const getCategories = async (
	type: string,
	id: string,
): Promise<CategoryDocument[]> => {
	const categories = await CategoryModel.find({
		type,
		team: id,
	})
		.lean()
		.exec()

	return Promise.resolve(categories)
}

/**
 * Create new category
 *
 * @param categoryData
 * @param teamId
 */
export const createCategory = async (
	data: Category,
	user: User,
): Promise<CategoryDocument> => {
	// Check if user is in the provided team id
	if (!user.teams.includes(data.team)) {
		return Promise.reject(
			apiError.badRequest(
				'This user does not belong to the team with that id',
				ErrorCode.notATeamMember,
			),
		)
	}

	// Check if team already had that category
	const existingCategory = await await CategoryModel.findOne({
		name: data.name,
		team: data.team,
	})
		.lean()
		.exec()

	if (existingCategory) {
		return Promise.reject(
			apiError.badRequest(
				'There is already an existing category with that name',
				ErrorCode.categoryNameNotUnique,
			),
		)
	}

	const newCategory = await CategoryModel.create(data)

	return Promise.resolve(newCategory)
}
