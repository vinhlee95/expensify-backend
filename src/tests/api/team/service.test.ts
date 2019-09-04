import {addCategory, addExpenseItem, addTeam, addUser} from '../../utils/db'
import {
	createMockCategory,
	createMockExpenseItem,
	createMockTeam,
	createMockUser,
} from '../../utils/mock'
import {
	createCategory,
	createExpenseItem,
	getCategories,
	getExpenseItems,
} from '../../../resources/team/team.service'
import {getUserById} from '../../../resources/user/user.service'
import UserModel, {UserDocument} from '../../../resources/user/user.model'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryDocument} from '../../../resources/category/category.model'
import {CategoryType} from '../../../resources/category/category.interface'
import {ApiError} from '../../../utils/apiError'
import ExpenseItem from '../../../resources/expenseItem/expenseItem.interface'
import _ from 'lodash'

describe('[Team service]', () => {
	let user: UserDocument
	let user2: UserDocument
	let team: TeamDocument
	let team2: TeamDocument
	let teamExpenseItems: ExpenseItem[]
	let teamCategories: CategoryDocument[]

	beforeEach(async () => {
		user = await addUser(createMockUser())
		user2 = await addUser(createMockUser())
		team = await addTeam(createMockTeam(user.id))
		team2 = await addTeam(createMockTeam(user2.id))

		user = await UserModel.findById(user.id)

		teamCategories = await Promise.all([
			addCategory(createMockCategory(team.id, CategoryType.Expense)),
			addCategory(createMockCategory(team.id, CategoryType.Income)),
			addCategory(createMockCategory(team.id, CategoryType.Income)),
		])

		await Promise.all([
			addCategory(createMockCategory(team2.id, CategoryType.Expense)),
			addCategory(createMockCategory(team2.id, CategoryType.Income)),
		])

		const expenseCategory = teamCategories[1]

		teamExpenseItems = await Promise.all(
			_.times(6, () =>
				addExpenseItem(
					createMockExpenseItem(team.id, user.id, expenseCategory.id),
				),
			),
		)
	})

	describe('createCategory', () => {
		it('should return new category', async () => {
			try {
				// Arrange
				user = await getUserById(user.id)
				const mockCategory = createMockCategory(team.id, CategoryType.Expense)

				// Act
				const createdCategory = await createCategory(mockCategory, user)

				// Expect
				expect(createdCategory.name).toEqual(mockCategory.name)
				expect(createdCategory.description).toEqual(mockCategory.description)
				expect(createdCategory.type).toEqual(mockCategory.type)
				expect(createdCategory.team.toString()).toEqual(mockCategory.team)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})

		it('should return error when create existed category', async () => {
			// Arrange
			const existedCategory = teamCategories[0]
			const mockCategory = {
				...createMockCategory(user.id),
				name: existedCategory.name,
			}

			// Act
			const createdCategory = createCategory(mockCategory, user)

			// Expect
			await expect(createdCategory).rejects.toThrow(ApiError)
		})
	})

	describe('getCategories', () => {
		it('should return all expense categories', async () => {
			try {
				// Arrange
				const teamExpenseCategories = teamCategories.filter(
					category => category.type === CategoryType.Expense,
				)

				// Act
				const expenseCategories = await getCategories(
					team.id,
					CategoryType.Expense,
				)

				// Expect
				expect(teamExpenseCategories.length).toEqual(expenseCategories.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})

		it('should return all income categories', async () => {
			try {
				// Arrange
				const teamIncomeCategories = teamCategories.filter(
					category => category.type === CategoryType.Income,
				)

				// Act
				const incomeCategories = await getCategories(
					team.id,
					CategoryType.Income,
				)

				// Expect
				expect(teamIncomeCategories.length).toEqual(incomeCategories.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})

		it('should return all categories', async () => {
			try {
				// Act
				const incomeCategories = await getCategories(team.id)

				// Expect
				expect(teamCategories.length).toEqual(incomeCategories.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})

	describe('createExpenseItem', () => {
		it('should create expense item when data is valid', async () => {
			// Arrange
			const expenseCategory = teamCategories.find(
				category => category.type === CategoryType.Expense,
			)
			const mockExpenseItem = createMockExpenseItem(
				team.id,
				user.id,
				expenseCategory.id,
			)

			// Act
			const expenseItem = await createExpenseItem(user, mockExpenseItem)

			// Expect
			expect(expenseItem.creator.toString()).toEqual(mockExpenseItem.creator)
			expect(expenseItem.category.toString()).toEqual(mockExpenseItem.category)
			expect(expenseItem.team.toString()).toEqual(mockExpenseItem.team)
			expect(expenseItem.name).toEqual(mockExpenseItem.name)
			expect(expenseItem.note).toEqual(mockExpenseItem.note)
			expect(expenseItem.date).toEqual(mockExpenseItem.date)
			expect(expenseItem.quantity).toEqual(mockExpenseItem.quantity)
			expect(expenseItem.price).toEqual(mockExpenseItem.price)
		})

		it('should throw error when create expense item with income category', async () => {
			// Arrange
			const expenseCategory = teamCategories.find(
				category => category.type === CategoryType.Income,
			)
			const mockExpenseItem = createMockExpenseItem(
				team.id,
				user.id,
				expenseCategory.id,
			)

			// Act
			const expenseItem = createExpenseItem(user, mockExpenseItem)

			// Expect
			await expect(expenseItem).rejects.toThrow(ApiError)
		})

		it('should throw error when create expense item with wrong team', async () => {
			// Arrange
			const expenseCategory = teamCategories.find(
				category => category.type === CategoryType.Expense,
			)
			const mockExpenseItem = createMockExpenseItem(
				team2.id,
				user.id,
				expenseCategory.id,
			)

			// Act
			const expenseItem = createExpenseItem(user, mockExpenseItem)

			// Expect
			await expect(expenseItem).rejects.toThrow(ApiError)
		})
	})

	describe('getExpenseItems', () => {
		it('should get expense items', async () => {
			// Act
			const expenseItems = await getExpenseItems(team.id)

			// Expect
			expect(expenseItems.length).toEqual(teamExpenseItems.length)
		})

		it('should get expense items with correct pagination', async () => {
			// Arrange
			const limit = 4

			// Act
			const expenseItems = await getExpenseItems(team.id, {limit})

			// Expect
			expect(expenseItems.length).toEqual(limit)
		})
	})
})
