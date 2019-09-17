import createLogger from '../../utils/logger'
import CategoryModel, {CategoryDocument} from '../category/category.model'
import ItemModel, {ItemDocument} from '../item/item.model'
import {Category, CategoryType} from '../category/category.interface'
import {User} from '../user/user.interface'
import apiError, {ErrorCode} from '../../utils/apiError'
import Item from '../item/item.interface'

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

export const createItem = async (
	user: User,
	data: Item,
): Promise<ItemDocument> => {
	logger.debug(`Create new item: %o`, data)

	// Check if user is in the provided team id
	if (!user.teams.includes(data.team)) {
		return Promise.reject(
			apiError.badRequest(
				'This user does not belong to the team with that id',
				ErrorCode.notATeamMember,
			),
		)
	}

	// Check valid category
	const category = await CategoryModel.findById(data.category)
		.lean()
		.exec()

	if (!category) {
		return Promise.reject(
			apiError.badRequest('Cannot find category with this id'),
		)
	}

	const newItem = await ItemModel.create(data)

	return Promise.resolve(newItem)
}

export const getItem = async (
	id: string,
	{offset = 0, limit = 20} = {},
): Promise<ItemDocument[]> => {
	logger.debug(`Get items for team id: ${id}`)

	const expenseItems = await ItemModel.find({
		team: id,
	})
		.skip(offset)
		.limit(limit)
		.populate('category')
		.lean()
		.exec()

	return Promise.resolve(expenseItems)
}
