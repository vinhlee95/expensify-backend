import httpStatus from 'http-status'
import faker from 'faker'
import _ from 'lodash'

import {apiRequest, getRoleWithPermisison, signInUser} from '../../utils/common'
import {addCategory, addExpenseItem, addTeam, addUser} from '../../utils/db'
import {
	createMockCategory,
	createMockExpenseItem,
	createMockTeam,
	createMockUser,
} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {UserDocument} from '../../../resources/user/user.model'
import {Permission} from '../../../middlewares/permission'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'
import {CategoryDocument} from '../../../resources/category/category.model'
import ExpenseItem from '../../../resources/expenseItem/expenseItem.interface'

describe('[TEAMS API]', () => {
	const roleWithReadCategory = getRoleWithPermisison(Permission.ReadCategory)
	const roleWithWriteCategory = getRoleWithPermisison(Permission.WriteCategory)
	const roleWithReadExpenseItem = getRoleWithPermisison(
		Permission.ReadExpenseItem,
	)
	const roleWithWriteExpenseItem = getRoleWithPermisison(
		Permission.WriteExpenseItem,
	)

	let user1: UserDocument
	let team1: TeamDocument
	let categories: CategoryDocument[]
	let teamExpenseItems: ExpenseItem[]
	let token: string

	beforeEach(async () => {
		user1 = await addUser(createMockUser(UserRole.User))
		team1 = await addTeam(createMockTeam(user1.id))

		categories = await Promise.all([
			addCategory(createMockCategory(team1.id, CategoryType.Expense)),
			addCategory(createMockCategory(team1.id, CategoryType.Income)),
		])

		const expenseCategory = categories.find(
			category => category.type === CategoryType.Expense,
		)

		teamExpenseItems = await Promise.all(
			_.times(6, () =>
				addExpenseItem(
					createMockExpenseItem(team1.id, user1.id, expenseCategory.id),
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
					type: faker.random.word,
				})

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})

		it(`[${roleWithReadCategory}]. should return 200 with a list of categories`, async () => {
			// Action
			const result = await apiRequest
				.get(`/api/teams/${team1.id}/categories`)
				.set('Authorization', token)
				.query({
					type: CategoryType.Income,
				})

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
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

	describe('POST /api/teams/:id/expenseItems', () => {
		it(`[${roleWithWriteExpenseItem}]. should return 200 with new created expenseItem when data is valid`, async () => {
			// Arrange
			const expenseCategory = categories.find(
				category => category.type === CategoryType.Expense,
			)

			const mockExpensItem = createMockExpenseItem(
				team1.id,
				user1.id,
				expenseCategory.id,
			)

			// Action
			const result = await apiRequest
				.post(`/api/teams/${team1.id}/expenseItems`)
				.set('Authorization', token)
				.send(mockExpensItem)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
		})

		it(`[${roleWithWriteExpenseItem}]. should return 200 with new created expenseItem with income category`, async () => {
			// Arrange
			const expenseCategory = categories.find(
				category => category.type === CategoryType.Income,
			)

			const mockExpensItem = createMockExpenseItem(
				team1.id,
				user1.id,
				expenseCategory.id,
			)

			// Action
			const result = await apiRequest
				.post(`/api/teams/${team1.id}/expenseItems`)
				.set('Authorization', token)
				.send(mockExpensItem)

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})
	})

	describe('GET /api/teams/:id/expenseItems', () => {
		it(`[${roleWithReadExpenseItem}]. should return 200 with expense items`, async () => {
			// Action
			const result = await apiRequest
				.get(`/api/teams/${team1.id}/expenseItems`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.length).toEqual(teamExpenseItems.length)
		})

		it(`[${roleWithReadExpenseItem}]. should return 200 with paginated expense items`, async () => {
			// Arrange
			const limit = 4

			// Action
			const result = await apiRequest
				.get(`/api/teams/${team1.id}/expenseItems?limit=${limit}`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.length).toEqual(limit)
		})
	})
})
