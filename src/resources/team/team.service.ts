import createLogger from '../../utils/logger'
import CategoryModel, {CategoryDocument} from '../category/category.model'
import ExpenseItemModel, {
	ExpenseItemDocument,
} from '../expenseItem/expenseItem.model'
import {Category, CategoryType} from '../category/category.interface'
import {User} from '../user/user.interface'
import apiError, {ErrorCode} from '../../utils/apiError'
import ExpenseItem from '../expenseItem/expenseItem.interface'

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

export const createExpenseItem = async (
	user: User,
	data: ExpenseItem,
): Promise<ExpenseItemDocument> => {
	logger.debug(`Create new expense item: %o`, data)

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

	if (category.type !== CategoryType.Expense) {
		return Promise.reject(apiError.badRequest('Category type must be expense'))
	}

	const newExpenseItem = await ExpenseItemModel.create(data)

	return Promise.resolve(newExpenseItem)
}

export const getExpenseItems = async (
	id: string,
	{offset = 0, limit = 20} = {},
): Promise<ExpenseItemDocument[]> => {
	logger.debug(`Get expense items for team id: ${id}`)

	const expenseItems = await ExpenseItemModel.find({
		team: id,
	})
		.skip(offset)
		.limit(limit)
		.populate('category')
		.lean()
		.exec()

	return Promise.resolve(expenseItems)
}
