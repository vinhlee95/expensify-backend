import httpStatus from 'http-status'
import faker from 'faker'
import _ from 'lodash'

import {apiRequest, getRoleWithPermisison, signInUser} from '../../utils/common'
import {addCategory, addExpenseItem, addTeam, addUser} from '../../utils/db'
import {
	createMockCategory,
	createMockItem,
	createMockTeam,
	createMockUser,
} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {UserDocument} from '../../../resources/user/user.model'
import {Permission} from '../../../middlewares/permission'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'
import {CategoryDocument} from '../../../resources/category/category.model'
import Item from '../../../resources/item/item.interface'
import {ErrorCode} from '../../../utils/apiError'

describe('[TEAMS API]', () => {
	const roleWithReadCategory = getRoleWithPermisison(Permission.ReadCategory)
	const roleWithWriteCategory = getRoleWithPermisison(Permission.WriteCategory)
	const roleWithReadItem = getRoleWithPermisison(Permission.ReadItem)
	const roleWithWriteItem = getRoleWithPermisison(Permission.WriteItem)

	let user1: UserDocument
	let team1: TeamDocument
	let user2: UserDocument
	let team: TeamDocument
	let expenseCategories: CategoryDocument[]
	let incomeCategories: CategoryDocument[]
	let teamItems: Item[]
	let token: string

	beforeEach(async () => {
		user1 = await addUser(createMockUser(UserRole.User))
		team1 = await addTeam(createMockTeam(user1.id))
		user2 = await addUser(createMockUser(UserRole.User))
		team = await addTeam(createMockTeam(user1.id))

		expenseCategories = await Promise.all([
			addCategory(createMockCategory(team1.id, CategoryType.Expense)),
			addCategory(createMockCategory(team1.id, CategoryType.Expense)),
		])

		incomeCategories = await Promise.all([
			addCategory(createMockCategory(team1.id, CategoryType.Income)),
			addCategory(createMockCategory(team1.id, CategoryType.Income)),
			addCategory(createMockCategory(team1.id, CategoryType.Income)),
		])

		teamItems = await Promise.all(
			_.times(6, () =>
				addExpenseItem(
					createMockItem(team1.id, user1.id, expenseCategories[0].id),
				),
			),
		)

		token = signInUser(user1)
	})

	describe('GET /api/teams/:id/categories', () => {
		it(`[${roleWithReadCategory}]. should return 400 with wrong category type`, async () => {
			// Action
			const result = await apiRequest
				.get(`/api/teams/${team1.id}/categories`)
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
				.get(`/api/teams/${team1.id}/categories`)
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
				.get(`/api/teams/${team1.id}/categories`)
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
				.get(`/api/teams/${team1.id}/categories`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.length).toEqual(categories.length)
		})
	})

	describe('POST /api/teams/:id/categories', () => {
		it(`[${roleWithWriteCategory}]. should return 400 with wrong or no category type`, async () => {
			const randomTypeCategory = {
				...createMockCategory(team1.id),
				type: faker.random.word(),
			}
			const noTypeCategory = _.omit(createMockCategory(team1.id), 'type')

			// Action
			const results = await Promise.all([
				apiRequest
					.post(`/api/teams/${team1.id}/categories`)
					.set('Authorization', token)
					.send(randomTypeCategory),
				apiRequest
					.post(`/api/teams/${team1.id}/categories`)
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
			const mockCategory = createMockCategory(team1.id, CategoryType.Expense)

			// Action
			const result = await apiRequest
				.post(`/api/teams/${team1.id}/categories`)
				.set('Authorization', token)
				.send(mockCategory)

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})

		it(`[${roleWithWriteCategory}]. should return 200 with new created category when data is valid`, async () => {
			const mockCategory = createMockCategory(team1.id, CategoryType.Expense)

			// Action
			const result = await apiRequest
				.post(`/api/teams/${team1.id}/categories`)
				.set('Authorization', token)
				.send(mockCategory)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
		})
	})

	describe('DELETE /api/teams/:id/categories/:categoryId', () => {
		it(`[${roleWithWriteCategory}]. should delete category`, async () => {
			// Arrange
			const category = incomeCategories[0]

			// Action
			const result = await apiRequest
				.del(`/api/teams/${team.id}/categories/${category.id}`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
		})
	})

	describe('PUT /api/teams/:id/categories/:categoryId', () => {
		it(`[${roleWithWriteCategory}]. should update category`, async () => {
			// Arrange
			const category = incomeCategories[0]

			const categoryUpdate = createMockCategory(team.id)

			// Action
			const result = await apiRequest
				.put(`/api/teams/${team.id}/categories/${category.id}`)
				.send(categoryUpdate)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
		})

		it(`[${roleWithReadItem}]. should return 200 with paginated items`, async () => {
			// Arrange
			const limit = 4

			// Action
			const result = await apiRequest
				.get(`/api/teams/${team1.id}/items?limit=${limit}`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.length).toEqual(limit)
		})

		it(`[${roleWithWriteCategory}]. should throw forbidden error when user is not team creator`, async () => {
			// Arrange
			const category = incomeCategories[0]
			const token2 = signInUser(user2)

			// Action
			const result = await apiRequest
				.put(`/api/teams/${team.id}/categories/${category.id}`)
				.set('Authorization', token2)

			// Expect
			expect(result.status).toEqual(httpStatus.FORBIDDEN)
			expect(result.body.errorCode).toEqual(ErrorCode.notACreator)
		})
	})

	describe('POST /api/teams/:id/items', () => {
		it(`[${roleWithWriteItem}]. should return 200 with new created item when data is valid`, async () => {
			// Arrange
			const category = expenseCategories[0]

			const mockItem = createMockItem(team1.id, user1.id, category.id)

			// Action
			const result = await apiRequest
				.post(`/api/teams/${team1.id}/items`)
				.set('Authorization', token)
				.send(mockItem)

			expect(result.status).toEqual(httpStatus.OK)
		})
	})

	describe('GET /api/teams/:id/items', () => {
		it(`[${roleWithReadItem}]. should return 200 with items`, async () => {
			// Action
			const result = await apiRequest.get(`/api/teams/${team1.id}/items`).set('Authorization', token)

			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.length).toEqual(teamItems.length)
		})

		it(`[${roleWithWriteCategory}]. should throw forbidden error when user is not team creator`, async () => {
			// Arrange
			const category = incomeCategories[0]
			const token2 = signInUser(user2)

			// Action
			const result = await apiRequest
				.del(`/api/teams/${team.id}/categories/${category.id}`)
				.set('Authorization', token2)

			// Expect
			expect(result.status).toEqual(httpStatus.FORBIDDEN)
			expect(result.body.errorCode).toEqual(ErrorCode.notACreator)
		})
	})
})
