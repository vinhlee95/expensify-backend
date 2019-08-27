import {Error} from 'mongoose'
import _ from 'lodash'
import {UserDocument} from '../../../resources/user/user.model'
import {addUser, addTeam, addCategory} from '../../utils/db'
import {
	createMockUser,
	createMockTeam,
	createMockCategory,
	createMockExpenseItem,
} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'
import {CategoryDocument} from '../../../resources/category/category.model'
import ExpenseItemModel from '../../../resources/expenseItem/expenseItem.model'

describe('[ExpenseItem model]', () => {
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

	it('should create new expense item when data is valid', async () => {
		// Arrange
		const mockExpenseItem = createMockExpenseItem(
			team.id,
			user.id,
			expenseCategory.id,
		)

		// Act
		const createdExpenseItem = await ExpenseItemModel.create(mockExpenseItem)

		// Expect
		expect(createdExpenseItem.name).toEqual(mockExpenseItem.name)
		expect(createdExpenseItem.note).toEqual(mockExpenseItem.note)
		expect(createdExpenseItem.date).toEqual(mockExpenseItem.date)
		expect(createdExpenseItem.team.toString()).toEqual(mockExpenseItem.team)
		expect(createdExpenseItem.category.toString()).toEqual(
			mockExpenseItem.category,
		)
		expect(createdExpenseItem.creator.toString()).toEqual(
			mockExpenseItem.creator,
		)
	})

	it('should throw error when there is no item name', async () => {
		// Arrange
		const mockExpenseItem = _.omit(
			createMockExpenseItem(team.id, user.id, expenseCategory.id),
			'name',
		)

		// Act
		const createdExpenseItem = ExpenseItemModel.create(mockExpenseItem)

		// Expect
		await expect(createdExpenseItem).rejects.toThrow(Error)
	})

	it('should throw error when there is no item category', async () => {
		// Arrange
		const mockExpenseItem = _.omit(
			createMockExpenseItem(team.id, user.id, expenseCategory.id),
			'category',
		)

		// Act
		const createdExpenseItem = ExpenseItemModel.create(mockExpenseItem)

		// Expect
		await expect(createdExpenseItem).rejects.toThrow(Error)
	})

	it('should throw error when there is no item creator', async () => {
		// Arrange
		const mockExpenseItem = _.omit(
			createMockExpenseItem(team.id, user.id, expenseCategory.id),
			'creator',
		)

		// Act
		const createdExpenseItem = ExpenseItemModel.create(mockExpenseItem)

		// Expect
		await expect(createdExpenseItem).rejects.toThrow(Error)
	})

	it('should throw error when there is no item team', async () => {
		// Arrange
		const mockExpenseItem = _.omit(
			createMockExpenseItem(team.id, user.id, expenseCategory.id),
			'team',
		)

		// Act
		const createdExpenseItem = ExpenseItemModel.create(mockExpenseItem)

		// Expect
		await expect(createdExpenseItem).rejects.toThrow(Error)
	})
})
