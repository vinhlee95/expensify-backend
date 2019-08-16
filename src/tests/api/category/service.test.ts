import UserModel, {UserDocument} from '../../../resources/user/user.model'
import {TeamDocument} from '../../../resources/team/team.model'
import {addCategory, addTeam, addUser} from '../../utils/db'
import {
	createMockCategory,
	createMockTeam,
	createMockUser,
} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {CategoryType} from '../../../resources/category/category.interface'
import {
	createOne,
	getCategoriesByTeam,
} from '../../../resources/category/category.service'
import {CategoryDocument} from '../../../resources/category/category.model'
import {ApiError} from '../../../utils/apiError'

describe('[Category service]', () => {
	let user: UserDocument
	let team: TeamDocument
	let teamCategories: CategoryDocument[]

	beforeEach(async () => {
		user = await addUser(createMockUser(UserRole.User, UserStatus.Active))
		team = await addTeam(createMockTeam(user.id))
		const team2 = await addTeam(createMockTeam(user.id))

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
	})

	describe('createOne', () => {
		it('should return new category', async () => {
			try {
				// Arrange
				const mockCategory = createMockCategory(team.id, CategoryType.Expense)

				// Act
				const createdCategory = await createOne(mockCategory, user)

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
			const createdCategory = createOne(mockCategory, user)

			// Expect
			await expect(createdCategory).rejects.toThrow(ApiError)
		})
	})

	describe('getCategoriesByTeam', () => {
		it('should return all expense categories', async () => {
			try {
				// Arrange
				const teamExpenseCategories = teamCategories.filter(
					category => category.type === CategoryType.Expense,
				)

				// Act
				const expenseCategories = await getCategoriesByTeam(
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
				const incomeCategories = await getCategoriesByTeam(
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
