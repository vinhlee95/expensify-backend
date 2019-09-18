import {addCategory, addItem, addTeam, addUser} from '../../utils/db'
import {
	createMockItem,
	createMockTeam,
	createMockUser,
	createMockCategory,
	createMockId,
} from '../../utils/mock'
import {
	createCategory,
	deleteCategory,
	getCategories,
	parseCategoryIdParam,
	parseTeamIdParam,
	updateCategory,
	createItem,
	getItems,
} from '../../../resources/team/team.service'
import {getUserById} from '../../../resources/user/user.service'
import UserModel, {UserDocument} from '../../../resources/user/user.model'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryDocument} from '../../../resources/category/category.model'
import {CategoryType} from '../../../resources/category/category.interface'
import {ApiError} from '../../../utils/apiError'
import Item from '../../../resources/item/item.interface'
import _ from 'lodash'

describe('[Team service]', () => {
	let user: UserDocument
	let user2: UserDocument
	let team: TeamDocument
	let team2: TeamDocument
	let teamItems: Item[]
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

		teamItems = await Promise.all(
			_.times(6, () =>
				addItem(createMockItem(team.id, user.id, expenseCategory.id)),
			),
		)
	})

	describe('parseTeamIdParam', () => {
		it('should return team when id is valid', async () => {
			// Act
			const foundTeam = await parseTeamIdParam(team.id)

			// Expect
			expect(foundTeam.id).toEqual(team.id)
		})

		it('should throw error when id is invalid', async () => {
			// Arrange
			const randomId = createMockId()

			// Act
			const foundTeam = parseTeamIdParam(randomId)

			// Expect
			await expect(foundTeam).rejects.toThrow(ApiError)
		})
	})

	describe('parseCategoryIdParam', () => {
		it('should return category when id is valid', async () => {
			// Arange
			const category = teamCategories[0]

			// Act
			const foundCategory = await parseCategoryIdParam(category.id)

			// Expect
			expect(foundCategory.id).toEqual(category.id)
		})

		it('should throw error when id is invalid', async () => {
			// Arrange
			const randomId = createMockId()

			// Act
			const foundCategory = parseCategoryIdParam(randomId)

			// Expect
			await expect(foundCategory).rejects.toThrow(ApiError)
		})
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

	describe('deleteCategory', () => {
		it('should delete category', async () => {
			// Arrange
			const category = teamCategories[0]

			// Act
			const deletedCategory = await deleteCategory(category)

			// Expect
			expect(deletedCategory.id.toString()).toEqual(category.id)
		})
	})

	describe('updateCategory', () => {
		it('should update category', async () => {
			// Arrange
			const category = teamCategories[0]
			const categoryUpdate = createMockCategory(team.id)

			// Act
			const updatedCategory = await updateCategory(category, categoryUpdate)

			// Expect
			expect(updatedCategory.id.toString()).toEqual(category.id)
			expect(updatedCategory.name).toEqual(categoryUpdate.name)
			expect(updatedCategory.type).toEqual(categoryUpdate.type)
		})
	})

	describe('createItem', () => {
		it('should create item when data is valid', async () => {
			// Arrange
			const category = teamCategories[0]

			const mockItem = createMockItem(team.id, user.id, category.id)

			// Act
			const createdItem = await createItem(user, mockItem)

			// Expect
			expect(createdItem.creator.toString()).toEqual(mockItem.creator)
			expect(createdItem.category.toString()).toEqual(mockItem.category)
			expect(createdItem.team.toString()).toEqual(mockItem.team)
			expect(createdItem.name).toEqual(mockItem.name)
			expect(createdItem.note).toEqual(mockItem.note)
			expect(createdItem.date).toEqual(mockItem.date)
			expect(createdItem.quantity).toEqual(mockItem.quantity)
			expect(createdItem.price).toEqual(mockItem.price)
		})

		it('should throw error when create item with wrong team', async () => {
			// Arrange
			const category = teamCategories[0]

			const mockItem = createMockItem(team2.id, user.id, category.id)

			// Act
			const item = createItem(user, mockItem)

			// Expect
			await expect(item).rejects.toThrow(ApiError)
		})
	})

	describe('getItems', () => {
		it('should get items', async () => {
			// Act
			const items = await getItems(team.id)

			// Expect
			expect(items.length).toEqual(teamItems.length)
		})

		it('should get items with correct pagination', async () => {
			// Arrange
			const limit = 4

			// Act
			const items = await getItems(team.id, {limit})

			// Expect
			expect(items.length).toEqual(limit)
		})
	})
})
