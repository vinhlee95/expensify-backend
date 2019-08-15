import { UserDocument } from "../../../resources/user/user.model";
import { TeamDocument } from "../../../resources/team/team.model";
import { addUser, addTeam, addCategory } from "../../utils/db";
import { createMockUser, createMockTeam, createMockCategory } from "../../utils/mock";
import { UserRole, UserStatus } from "../../../resources/user/user.interface";
import { CategoryType } from "../../../resources/category/category.interface";
import { createOne, getMany } from "../../../resources/category/category.service";

describe('[Category service]', () => {
	let user: UserDocument
	let team: TeamDocument

	beforeEach(async () => {
		user = await addUser(createMockUser(UserRole.User, UserStatus.Active))
		team = await addTeam(createMockTeam(user.id))
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
			} catch(e) {
				expect(e).toBeUndefined()
			}
		})
	})

	describe('getMany', () => {
		it('should return all categories', async () => {
			try {
				const [expenseCategory, anotherExpenseCategory, incomeCategory] = await Promise.all([
					addCategory(createMockCategory(CategoryType.Expense, team.id)),
					addCategory(createMockCategory(CategoryType.Expense, team.id)),
					addCategory(createMockCategory(CategoryType.Income, team.id)),
				])
				const addedExpenseCategories = [expenseCategory, anotherExpenseCategory]
				const adddedIncomeCategories = [incomeCategory]

				const [expenseCategories, incomeCategories] = await Promise.all([
					getMany(CategoryType.Expense, team.id),
					getMany(CategoryType.Income, team.id),
				])

				// Expect
				expect(expenseCategories.length).toEqual(addedExpenseCategories.length)
				expect(incomeCategories.length).toEqual(adddedIncomeCategories.length)
			} catch(e) {
				expect(e).toBeUndefined()
			}
		})
	})
})