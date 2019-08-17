import {addUser, addTeam, addCategory} from '../../utils/db'
import {
	createMockTeam,
	createMockUser,
	createMockCategory,
} from '../../utils/mock'
import {
	createOne,
	createCategory,
	getCategories,
} from '../../../resources/team/team.service'
import {UserDocument} from '../../../resources/user/user.model'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryDocument} from '../../../resources/category/category.model'
import {CategoryType} from '../../../resources/category/category.interface'
import {ApiError} from '../../../utils/apiError'

describe('[Team service]', () => {
	let user: UserDocument
	let team: TeamDocument
	let teamCategories: CategoryDocument[]

	beforeEach(async () => {
		user = await addUser(createMockUser())
		team = await addTeam(createMockTeam(user.id))
		const team2 = await addTeam(createMockTeam(user.id))

		teamCategories = await Promise.all([
			addCategory(createMockCategory(team.id, CategoryType.Expense)),
			addCategory(createMockCategory(team.id, CategoryType.Income)),
			addCategory(createMockCategory(team.id, CategoryType.Income)),
		])

		await Promise.all([
			addCategory(createMockCategory(team2.id, CategoryType.Expense)),
			addCategory(createMockCategory(team2.id, CategoryType.Income)),
		])
	})

	describe('createOne', () => {
		it('should return correct team and add save team id to user', async () => {
			try {
				// Arrange
				const mockTeam = createMockTeam(user.id)

				// Action
				const createdTeam = await createOne(mockTeam)

				// Expect
				expect(createdTeam.name).toEqual(mockTeam.name)
				expect(createdTeam.creator.toString()).toEqual(user.id)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})

	describe('createCategory', () => {
		it('should return new category', async () => {
			try {
				// Arrange
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
					CategoryType.Expense,
					team.id,
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
					CategoryType.Income,
					team.id,
				)

				// Expect
				expect(teamIncomeCategories.length).toEqual(incomeCategories.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})
})
