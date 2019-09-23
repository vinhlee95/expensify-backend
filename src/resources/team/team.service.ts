import createLogger from '../../utils/logger'
import CategoryModel, {CategoryDocument} from '../category/category.model'
import ItemModel, {ItemDocument} from '../item/item.model'
import Item, {ItemInput} from '../item/item.interface'
import {
	Category,
	CategoryInput,
	CategoryType,
} from '../category/category.interface'
import apiError, {ErrorCode, notFound} from '../../utils/apiError'
import {TeamDocument} from './team.model'
import TeamModel from './team.model'
import * as _ from 'lodash'
import {Sort} from '../../middlewares/validator'
import {getMonthBounds} from '../../utils/util'

const logger = createLogger(module)

export const parseTeamIdParam = async (id: string): Promise<TeamDocument> => {
	const team = await TeamModel.findById(id).exec()

	if (!team) {
		throw notFound('Cannot find team with that id')
	}

	return team
}

export const parseCategoryIdParam = async (
	id: string,
): Promise<CategoryDocument> => {
	const category = await CategoryModel.findById(id).exec()

	if (!category) {
		throw notFound('Cannot find category with that id')
	}

	return category
}

export const parseItemIdParam = async (id: string): Promise<ItemDocument> => {
	const item = await ItemModel.findById(id).exec()

	if (!item) {
		throw notFound('Cannot find item with that id')
	}

	return item
}

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
): Promise<CategoryDocument> => {
	logger.debug(`Create new category: %o`, data)

	// Check if team already had that category
	const existingCategory = await CategoryModel.findOne({
		team: data.team,
		name: data.name,
	})
		.lean()
		.exec()

	if (existingCategory) {
		throw apiError.badRequest(
			'There is already an existing category with that name',
			ErrorCode.categoryNameNotUnique,
		)
	}

	const newCategory = await CategoryModel.create(data)

	return newCategory
}

export const deleteCategory = async (
	category: CategoryDocument,
): Promise<CategoryDocument> => {
	logger.debug(`Delete category with id: ${category.id}`)

	return category.remove()
}

export const updateCategory = async (
	category: CategoryDocument,
	categoryUpdate: CategoryInput,
): Promise<CategoryDocument> => {
	logger.debug(`Update category with id: ${category.id}`)

	_.merge(category, categoryUpdate)

	return category.save()
}

export const createItem = async (data: Item): Promise<ItemDocument> => {
	logger.debug(`Create new item: %o`, data)

	// Check valid category
	const category = await CategoryModel.findById(data.category)
		.lean()
		.exec()

	if (!category) {
		throw apiError.badRequest('Cannot find category with this id')
	}

	const newItem = await ItemModel.create(data)

	return newItem.populate('category', 'name').execPopulate()
}

export const getItems = (
	id: string,
	{
		offset = 0,
		field = 'date',
		sort = Sort.desc,
		search = '',
		limit = 9999,
		from = getMonthBounds().firstDay,
		to = getMonthBounds().today,
	} = {},
): Promise<ItemDocument[]> => {
	logger.debug(`Get items for team id: ${id}`)

	const query = ItemModel.find({
		team: id,
	}).populate('category')

	if (field) {
		query.sort({[field]: sort})
	}

	query
		.skip(offset)
		.limit(limit)
		.lean()
		.where({date: {$gte: from, $lte: to}})

	if (search) {
		const searchRegex = new RegExp(`^${search}`, 'i')

		query.where({name: {$regex: searchRegex, $options: 'i'}})
	}

	return query.exec()
}

export const deleteItem = (item: ItemDocument): Promise<ItemDocument> => {
	logger.debug(`Delete item with id: ${item.id}`)

	return item.remove()
}

export const updateItem = (
	item: ItemDocument,
	itemUpdate: ItemInput,
): Promise<ItemDocument> => {
	logger.debug(`Update item with id: ${item.id}`)

	_.merge(item, itemUpdate)

	return item.save()
}
