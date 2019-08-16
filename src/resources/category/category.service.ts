import CategoryModel, {CategoryDocument} from './category.model'
import {Category} from './category.interface'
import apiError, {ErrorCode} from '../../utils/apiError'
import {User} from '../user/user.interface'

/**
 * Get all categories
 *
 * @param type
 * @param teamId
 */
export const getMany = async (
	type: string,
	teamId: string,
): Promise<CategoryDocument[]> => {
	const categories = await CategoryModel.find({
		type,
		team: teamId,
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
export const createOne = async (
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
