import {Error} from 'mongoose'
import _ from 'lodash'
import {UserDocument} from '../../../resources/user/user.model'
import {addUser, addTeam, addCategory} from '../../utils/db'
import {
	createMockUser,
	createMockTeam,
	createMockCategory,
	createMockItem,
} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'
import {CategoryDocument} from '../../../resources/category/category.model'
import ItemModel from '../../../resources/item/item.model'

describe('[Item model]', () => {
	let user: UserDocument
	let team: TeamDocument
	let expenseCategory: CategoryDocument

	beforeEach(async () => {
		user = await addUser(createMockUser(UserRole.User, UserStatus.Active))
		team = await addTeam(createMockTeam(user.id))
		expenseCategory = await addCategory(
			createMockCategory(team.id, CategoryType.Expense),
		)
	})

	it('should create new item when data is valid', async () => {
		// Arrange
		const mockExpenseItem = createMockItem(team.id, user.id, expenseCategory.id)

		// Act
		const createdItem = await ItemModel.create(mockExpenseItem)

		// Expect
		expect(createdItem.name).toEqual(mockExpenseItem.name)
		expect(createdItem.note).toEqual(mockExpenseItem.note)
		expect(createdItem.date).toEqual(mockExpenseItem.date)
		expect(createdItem.team.toString()).toEqual(mockExpenseItem.team)
		expect(createdItem.category.toString()).toEqual(mockExpenseItem.category)
		expect(createdItem.creator.toString()).toEqual(mockExpenseItem.creator)
	})

	it('should throw error when there is no item name', async () => {
		// Arrange
		const mockItem = _.omit(
			createMockItem(team.id, user.id, expenseCategory.id),
			'name',
		)

		// Act
		const createdItem = ItemModel.create(mockItem)

		// Expect
		await expect(createdItem).rejects.toThrow(Error)
	})

	it('should throw error when there is no item category', async () => {
		// Arrange
		const mockItem = _.omit(
			createMockItem(team.id, user.id, expenseCategory.id),
			'category',
		)

		// Act
		const createdExpenseItem = ItemModel.create(mockItem)

		// Expect
		await expect(createdExpenseItem).rejects.toThrow(Error)
	})

	it('should throw error when there is no item creator', async () => {
		// Arrange
		const mockItem = _.omit(
			createMockItem(team.id, user.id, expenseCategory.id),
			'creator',
		)

		// Act
		const createdItem = ItemModel.create(mockItem)

		// Expect
		await expect(createdItem).rejects.toThrow(Error)
	})

	it('should throw error when there is no item team', async () => {
		// Arrange
		const mockExpenseItem = _.omit(
			createMockItem(team.id, user.id, expenseCategory.id),
			'team',
		)

		// Act
		const createdItem = ItemModel.create(mockExpenseItem)

		// Expect
		await expect(createdItem).rejects.toThrow(Error)
	})
})
