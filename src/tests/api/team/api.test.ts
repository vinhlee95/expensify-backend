import httpStatus from 'http-status'
import _ from 'lodash'
import faker from 'faker'

import {getRoleWithPermisison, signInUser, apiRequest} from '../../utils/common'
import {Permission} from '../../../middlewares/permission'
import {addUser, addTeam} from '../../utils/db'
import {createMockUser, createMockTeam} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {UserDocument} from '../../../resources/user/user.model'
import {ErrorCode} from '../../../utils/apiError'

describe('[TEAMS API]', () => {
	const roleWithWriteTeam = getRoleWithPermisison(Permission.WriteTeam)
	const roleWithReadTeam = getRoleWithPermisison(Permission.ReadTeam)

	let user: UserDocument
	let token: string

	beforeEach(async () => {
		user = await addUser(createMockUser(UserRole.Admin))
		token = signInUser(user)
	})

	describe('GET /api/teams', () => {
		it(`[${roleWithReadTeam}]. should return 400 user id is not provided as a param`, async () => {
			// Action
			const result = await apiRequest
				.get('/api/teams')
				.set('Authorization', token)
			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})
	})

	describe('GET /api/teams', () => {
		it(`[${roleWithReadTeam}]. should return 200 with teams that user belongs to`, async () => {
			// Arrange
			await addTeam(createMockTeam(user._id))
			// Action
			const result = await apiRequest
				.get('/api/teams')
				.set('Authorization', token)
				.query({userId: user._id.toString()})

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
		})
	})

	describe('POST /api/teams', () => {
		it(`[${roleWithWriteTeam}]. should return 201 with new created team`, async () => {
			// Arrange
			const teamData = createMockTeam()

			// Action
			const result = await apiRequest
				.post('/api/teams')
				.set('Authorization', token)
				.send(teamData)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data.name).toEqual(teamData.name)
		})

		it(`[${roleWithWriteTeam}]. should return 400 when team name is neither provided nor a string`, async () => {
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
		it('should return 201 when there is no token', async () => {
			// Arrange

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
			const teamData = createMockTeam()

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
