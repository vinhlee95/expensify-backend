// Utils
import createLogger from '../../utils/logger'
import CategoryModel, {CategoryDocument} from '../category/category.model'
import {Category, CategoryType} from '../category/category.interface'
import {User} from '../user/user.interface'
import apiError, {ErrorCode} from '../../utils/apiError'
import {TeamDocument} from './team.model'
import {UserDocument} from '../user/user.model'

const logger = createLogger(module)

/**
 * Get all categories
 *
 * @param TYPE
 * @param teamId
 */
export const getCategories = async (
	id: string,
	type?: CategoryType,
): Promise<CategoryDocument[]> => {
	interface Query {
		team: string
		type?: CategoryType
	}

	let query: Query = {team: id}

	if (type) {
		query.type = type
	}

	const categories = await CategoryModel.find(query)
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
	logger.debug(`Create new category: %o`, data)
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

export const deleteCategory = async (
	team: TeamDocument,
	category: CategoryDocument,
	user: UserDocument,
): Promise<CategoryDocument> => {
	logger.debug(`Delete category with id: ${category.id}`)

	// Check if user is creator
	if (!team.creator.equals(user.id)) {
		return Promise.reject(
			apiError.forbidden(
				'This user is not team creator',
				ErrorCode.notACreator,
			),
		)
	}

	return category.remove()
}
