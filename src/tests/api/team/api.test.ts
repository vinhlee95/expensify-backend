import httpStatus from 'http-status'
import faker from 'faker'
import _ from 'lodash'

import {signInUser, apiRequest, getRoleWithPermisison} from '../../utils/common'
import {addUser, addTeam, addCategory} from '../../utils/db'
import {
	createMockUser,
	createMockTeam,
	createMockCategory,
} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {UserDocument} from '../../../resources/user/user.model'
import {Permission} from '../../../middlewares/permission'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'
import {CategoryDocument} from '../../../resources/category/category.model'

describe('[TEAMS API]', () => {
	const roleWithReadCategory = getRoleWithPermisison(Permission.ReadCategory)
	const roleWithWriteCategory = getRoleWithPermisison(Permission.WriteCategory)

	let user1: UserDocument
	let team: TeamDocument
	let incomeCategories: CategoryDocument[]
	let expenseCategories: CategoryDocument[]
	let token: string

	beforeEach(async () => {
		user1 = await addUser(createMockUser(UserRole.User))
		team = await addTeam(createMockTeam(user1.id))

		expenseCategories = await Promise.all([
			addCategory(createMockCategory(team.id, CategoryType.Expense)),
			addCategory(createMockCategory(team.id, CategoryType.Expense)),
		])

		incomeCategories = await Promise.all([
			addCategory(createMockCategory(team.id, CategoryType.Income)),
			addCategory(createMockCategory(team.id, CategoryType.Income)),
			addCategory(createMockCategory(team.id, CategoryType.Income)),
		])

		token = signInUser(user1)
	})

	describe('GET /api/teams/:id/categories', () => {
		it(`[${roleWithReadCategory}]. should return 400 with wrong category type`, async () => {
			// Action
			const result = await apiRequest
				.get(`/api/teams/${team.id}/categories`)
				.set('Authorization', token)
				.query({
					type: faker.random.word(),
				})

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})

		it(`[${roleWithReadCategory}]. should return 200 with a list of income categories`, async () => {
			// Action
			const result = await apiRequest
				.get(`/api/teams/${team.id}/categories`)
				.set('Authorization', token)
				.query({
					type: CategoryType.Income,
				})

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.length).toEqual(incomeCategories.length)
		})

		it(`[${roleWithReadCategory}]. should return 200 with a list of expense categories`, async () => {
			// Action
			const result = await apiRequest
				.get(`/api/teams/${team.id}/categories`)
				.set('Authorization', token)
				.query({
					type: CategoryType.Expense,
				})

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.length).toEqual(expenseCategories.length)
		})

		it(`[${roleWithReadCategory}]. should return 200 with a list of all categories`, async () => {
			// Arrange
			const categories = [...expenseCategories, ...incomeCategories]

			// Action
			const result = await apiRequest
				.get(`/api/teams/${team.id}/categories`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.length).toEqual(categories.length)
		})
	})

	describe('POST /api/teams/:id/categories', () => {
		it(`[${roleWithWriteCategory}]. should return 400 with wrong or no category type`, async () => {
			const randomTypeCategory = {
				...createMockCategory(team.id),
				type: faker.random.word(),
			}
			const noTypeCategory = _.omit(createMockCategory(team.id), 'type')

			// Action
			const results = await Promise.all([
				apiRequest
					.post(`/api/teams/${team.id}/categories`)
					.set('Authorization', token)
					.send(randomTypeCategory),
				apiRequest
					.post(`/api/teams/${team.id}/categories`)
					.set('Authorization', token)
					.send(noTypeCategory),
			])

			// Expect
			results.forEach(result => {
				expect(result.status).toEqual(httpStatus.BAD_REQUEST)
			})
		})

		it(`[${roleWithWriteCategory}]. should return 400 when user does not belong to provided team`, async () => {
			const noMemberUser = await addUser(
				createMockUser(UserRole.User, UserStatus.Active),
			)
			const token = signInUser(noMemberUser)
			const mockCategory = createMockCategory(team.id, CategoryType.Expense)

			// Action
			const result = await apiRequest
				.post(`/api/teams/${team.id}/categories`)
				.set('Authorization', token)
				.send(mockCategory)

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})

		it(`[${roleWithWriteCategory}]. should return 200 with new created category when data is valid`, async () => {
			const mockCategory = createMockCategory(team.id, CategoryType.Expense)

			// Action
			const result = await apiRequest
				.post(`/api/teams/${team.id}/categories`)
				.set('Authorization', token)
				.send(mockCategory)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
		})
	})
})
