// Utils
import createLogger from '../../utils/logger'
import CategoryModel, {CategoryDocument} from '../category/category.model'
import {Category} from '../category/category.interface'
import {User} from '../user/user.interface'
import apiError, {ErrorCode} from '../../utils/apiError'

const logger = createLogger(module)

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
	logger.debug(`Get categories by type: %o`, type)
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
