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
import {createOne, getMany} from '../../../resources/category/category.service'
import {CategoryDocument} from '../../../resources/category/category.model'

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
			addCategory(createMockCategory(CategoryType.Expense, team.id)),
			addCategory(createMockCategory(CategoryType.Income, team.id)),
			addCategory(createMockCategory(CategoryType.Income, team.id)),
		])

		await Promise.all([
			addCategory(createMockCategory(CategoryType.Expense, team2.id)),
			addCategory(createMockCategory(CategoryType.Income, team2.id)),
		])
	})

	describe('createOne', () => {
		it('should return new category', async () => {
			try {
				const mockCategory = createMockCategory(CategoryType.Expense, team.id)

				// Action
				const createdCategory = await createOne(mockCategory, user)

				// Expect
				expect(createdCategory.name).toEqual(mockCategory.name)
				expect(createdCategory.description).toEqual(mockCategory.description)
				expect(createdCategory.type).toEqual(mockCategory.type)
				expect(createdCategory.teamId.toString()).toEqual(mockCategory.teamId)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})

	describe('getMany', () => {
		it('should return all expense categories', async () => {
			try {
				// Arrange
				const team1ExpenseCategories = teamCategories.filter(
					category => category.type === CategoryType.Expense,
				)

				// Action
				const expenseCategories = await getMany(CategoryType.Expense, team.id)

				// Expect
				expect(team1ExpenseCategories.length).toEqual(expenseCategories.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})

		it('should return all income categories', async () => {
			try {
				// Arrange
				const team1IncomeCategories = teamCategories.filter(
					category => category.type === CategoryType.Income,
				)

				// Action
				const incomeCategories = await getMany(CategoryType.Income, team.id)

				// Expect
				expect(team1IncomeCategories.length).toEqual(incomeCategories.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})
})
