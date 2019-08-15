import {Error} from 'mongoose'
import faker from 'faker'
import { UserDocument } from "../../../resources/user/user.model";
import { addUser, addTeam } from "../../utils/db";
import { createMockUser, createMockTeam, createMockCategory } from "../../utils/mock";
import { UserRole, UserStatus } from "../../../resources/user/user.interface";
import { TeamDocument } from "../../../resources/team/team.model";
import { CategoryType } from "../../../resources/category/category.interface";
import CategoryModel from "../../../resources/category/category.model";

describe('[Category model]', () => {
	let user: UserDocument
	let team: TeamDocument

	beforeEach(async () => {
		user = await addUser(createMockUser(UserRole.User, UserStatus.Active))
		team = await addTeam(createMockTeam(user.id))
	})

	it('should create new category when data is valid', async () => {
		const mockCategory = createMockCategory(CategoryType.Expense, team.id)
		const createdCategory = await CategoryModel.create(mockCategory)

		// Expect
		expect(createdCategory.name).toEqual(mockCategory.name)
		expect(createdCategory.description).toEqual(mockCategory.description)
		expect(createdCategory.type).toEqual(mockCategory.type)
		expect(createdCategory.teamId.toString()).toEqual(mockCategory.teamId)
	})

	it('should throw error when there is no team name', async () => {
		const mockCategory = createMockCategory(CategoryType.Expense, team.id)
		mockCategory.name = ''
		const createdCategory = CategoryModel.create(mockCategory)
		// Expect
		await expect(createdCategory).rejects.toThrow(Error)
	})

	it('should throw error when there is no type', async () => {
		const mockCategory = {
			name: faker.random.word(),
			teamId: team.id
		}
		const createdCategory = CategoryModel.create(mockCategory)
		// Expect
		await expect(createdCategory).rejects.toThrow(Error)
	})

	it('should throw error when there is no teamId', async () => {
		const mockCategory = {
			name: faker.random.word(),
			type: CategoryType.Expense
		}
		const createdCategory = CategoryModel.create(mockCategory)
		// Expect
		await expect(createdCategory).rejects.toThrow(Error)
	})
})