import httpStatus from 'http-status'
import faker from 'faker'
import _ from 'lodash'

import {signInUser, apiRequest, getRoleWithPermisison} from '../../utils/common'
import {addUser, addTeam} from '../../utils/db'
import {
	createMockUser,
	createMockTeam,
	createMockCategory,
} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {UserDocument} from '../../../resources/user/user.model'
import {ErrorCode} from '../../../utils/apiError'
import {Permission} from '../../../middlewares/permission'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'

describe('[TEAMS API]', () => {
	const roleWithReadCategory = getRoleWithPermisison(Permission.ReadCategory)
	const roleWithWriteCategory = getRoleWithPermisison(Permission.WriteCategory)

	let user1: UserDocument
	let team: TeamDocument
	let token: string

	beforeEach(async () => {
		user1 = await addUser(createMockUser(UserRole.User))
		team = await addTeam(createMockTeam(user1.id))
		token = signInUser(user1)
	})

	describe('GET /api/teams/:id/categories', () => {
		it(`[${roleWithReadCategory}]. should return 400 with wrong category type`, async () => {
			// Action
			const result = await apiRequest
				.get(`/api/teams/${team.id}/categories`)
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
				.get(`/api/teams/${team.id}/categories`)
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

	describe('POST /api/teams', () => {
		it(`User. should return 201 with new created team`, async () => {
			// Arrange
			const teamData = createMockTeam(user1.id)

			// Action
			const result = await apiRequest
				.post('/api/teams')
				.set('Authorization', token)
				.send(teamData)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.name).toEqual(teamData.name)
		})

		it(`User. should return 400 when team name is neither provided nor a string`, async () => {
			// Arrange
			const noNameData = {}
			const nonStringNameData = {name: faker.random.number}

			// Action
			const results = await Promise.all([
				apiRequest
					.post('/api/teams')
					.set('Authorization', token)
					.send(noNameData),
				apiRequest
					.post('/api/teams')
					.set('Authorization', token)
					.send(nonStringNameData),
			])

			// Expect
			results.forEach(res => {
				expect(res.status).toEqual(httpStatus.BAD_REQUEST)
			})
		})
	})

	describe('Authentication and authorization', () => {
		it('should return 401 when there is no token', async () => {
			// Action
			const results = await Promise.all([apiRequest.post('/api/teams')])

			// Expect
			results.forEach(res =>
				expect(res.status).toEqual(httpStatus.UNAUTHORIZED),
			)
		})
	})

	const testAuthorization = (userStatus: UserStatus) => {
		it(`should return 403 when user status is ${userStatus}`, async () => {
			// Arrange
			const noAccessRightUser = await addUser(
				createMockUser(undefined, userStatus),
			)
			const noAccessRightToken = signInUser(noAccessRightUser)
			const teamData = createMockTeam(noAccessRightUser.id)

			// Action
			const results = await Promise.all([
				apiRequest
					.post('/api/teams')
					.set('Authorization', noAccessRightToken)
					.send(teamData),
			])

			// Expect
			results.forEach(res => {
				expect(res.status).toEqual(httpStatus.FORBIDDEN)
				expect(res.body.errorCode).toEqual(ErrorCode.notActiveUser)
			})
		})
	}
	;[UserStatus.Initial, UserStatus.Disabled].forEach(testAuthorization)
})
