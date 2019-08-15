import CategoryModel, {CategoryDocument} from './category.model'
import { Category } from './category.interface';
import apiError, { ErrorCode } from '../../utils/apiError';
import { User } from '../user/user.interface';

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

	return categories
}

/**
 * Create new category
 *
 * @param categoryData
 * @param teamId
 */
export const createOne = async (data: Category, user: User): Promise<CategoryDocument> => {
	console.log(data, user)
	// Check if user is in the provided team id
	if(!isMemberofTeam(user.teams, data.teamId)) {
		return Promise.reject(apiError.badRequest('This user does not belong to the team with that id', ErrorCode.notATeamMember))
	}

	// Check if team already had that category
	const existingCategory = await getByName(data.name, data.teamId)
	if(existingCategory) {
		return Promise.reject(apiError.badRequest('There is already an existing category with that name', ErrorCode.categoryNameNotUnique))
	}

	const newCategory = await CategoryModel.create(data)
	return newCategory
}

const getByName = async (name: string, teamId: string): Promise<CategoryDocument> => {
	const category = await CategoryModel.findOne({name, teamId}).lean().exec()
	if(!category) { return Promise.resolve(null) }

	return Promise.resolve(category)
}

const isMemberofTeam = (teamIds: [string], teamId: string) => teamIds.some(id => id == teamId)