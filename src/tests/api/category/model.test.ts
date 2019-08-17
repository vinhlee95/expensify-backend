import {Error} from 'mongoose'
import _ from 'lodash'
import {UserDocument} from '../../../resources/user/user.model'
import {addUser, addTeam} from '../../utils/db'
import {
	createMockUser,
	createMockTeam,
	createMockCategory,
} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'
import CategoryModel from '../../../resources/category/category.model'

describe('[Category model]', () => {
	let user: UserDocument
	let team: TeamDocument

	beforeEach(async () => {
		user = await addUser(createMockUser(UserRole.User, UserStatus.Active))
		team = await addTeam(createMockTeam(user.id))
	})

	it('should create new category when data is valid', async () => {
		// Arrange
		const mockCategory = createMockCategory(team.id, CategoryType.Expense)

		// Act
		const createdCategory = await CategoryModel.create(mockCategory)

		// Expect
		expect(createdCategory.name).toEqual(mockCategory.name)
		expect(createdCategory.description).toEqual(mockCategory.description)
		expect(createdCategory.type).toEqual(mockCategory.type)
		expect(createdCategory.team.toString()).toEqual(mockCategory.team)
	})

	it('should throw error when there is no team name', async () => {
		// Arrange
		const mockCategory = _.omit(createMockCategory(team.id), 'name')

		// Act
		const createdCategory = CategoryModel.create(mockCategory)

		// Expect
		await expect(createdCategory).rejects.toThrow(Error)
	})

	it('should throw error when there is no type', async () => {
		// Arrange
		const mockCategory = _.omit(createMockCategory(team.id), 'type')

		// Act
		const createdCategory = CategoryModel.create(mockCategory)

		// Expect
		await expect(createdCategory).rejects.toThrow(Error)
	})

	it('should throw error when there is no team', async () => {
		// Arrange
		const mockCategory = _.omit(createMockCategory(team.id), 'team')

		// Act
		const createdCategory = CategoryModel.create(mockCategory)

		// Expect
		await expect(createdCategory).rejects.toThrow(Error)
	})
})
