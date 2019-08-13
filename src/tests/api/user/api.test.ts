import httpStatus from 'http-status'
import _ from 'lodash'
import faker from 'faker'
import {addUser} from '../../utils/db'
import {createMockId, createMockUser} from '../../utils/mock'
import {
	apiRequest,
	filterArrayBySearchText,
	findUserWithRoleAndSignIn,
	getRoleWithoutPermission,
	getRoleWithPermisison,
	signInUser,
} from '../../utils/common'
import {UserDocument} from '../../../resources/user/user.model'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {ErrorCode} from '../../../utils/apiError'
import {Permission} from '../../../middlewares/permission'
import {Sort} from '../../../middlewares/validator'

describe('[USERS API]', () => {
	const sortFields = ['firstName', 'lastName', 'email', 'role']
	const notAllowedUpdateUserFields = ['email', 'password']
	const notAllowedUpdateMeFields = ['email', 'password', 'role']

	const roleWithReadUser = getRoleWithPermisison(Permission.ReadUser)
	const roleWithWriteUser = getRoleWithPermisison(Permission.WriteUser)
	const roleWithoutWriteUser = getRoleWithoutPermission(Permission.WriteUser)

	let users: UserDocument[]
	let dummyUser: UserDocument

	beforeEach(async () => {
		// Arrange

		;[dummyUser] = users = await Promise.all([
			addUser(createMockUser()),
			addUser(createMockUser(UserRole.User)),
			addUser(createMockUser(UserRole.Admin)),
		])
	})

	describe('GET /api/users/:id', () => {
		it(`[${roleWithReadUser}]. should return 200 with found user`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithReadUser)

			// Action
			const result = await apiRequest
				.get(`/api/users/${dummyUser.id}`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data).toEqualUser(dummyUser)
		})

		it(`[${roleWithReadUser}]. should return 404 when user not found`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithReadUser)

			const mockId = createMockId()

			// Action
			const res = await apiRequest
				.get(`/api/users/${mockId}`)
				.set('Authorization', token)

			// Expect
			expect(res.status).toEqual(httpStatus.NOT_FOUND)
		})
	})

	describe('GET /api/users/me', () => {
		it(`[${roleWithReadUser}]. should return 200 with my profile`, async () => {
			// Arrange
			const {user, token} = findUserWithRoleAndSignIn(users, roleWithReadUser)

			// Action
			const result = await apiRequest
				.get('/api/users/me')
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data).toEqualUser(user)
		})
	})

	describe('GET /api/users', () => {
		it(`[${roleWithReadUser}]. should return 200 with all users`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithReadUser)

			// Action
			const result = await apiRequest
				.get('/api/users')
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)

			const {records} = result.body.data
			expect(records.length).toEqual(users.length)
		})

		it(`[${roleWithReadUser}]. should return 200 with users matched search text`, async () => {
			// Arrange
			const {token, user} = findUserWithRoleAndSignIn(users, roleWithReadUser)

			const searchText = user.firstName.substring(1)
			const searchField = ['firstName', 'lastName', 'email']

			const expectedSearchUsers = filterArrayBySearchText(
				users,
				searchField,
				searchText,
			)

			// Action
			const result = await apiRequest
				.get('/api/users')
				.query({search: searchText})
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)

			const {records} = result.body.data
			expect(records.length).toEqual(expectedSearchUsers.length)
		})

		const testUsersSortedByField = async (field: string, sort: Sort) => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithReadUser)

			// Action
			const result = await apiRequest
				.get('/api/users')
				.query({field, sort})
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)

			const {records} = result.body.data
			expect(records.length).toEqual(users.length)
		}

		sortFields.forEach(field => {
			it(`[${roleWithReadUser}]. should return 200 with field ${field} sorted asc`, async () => {
				await testUsersSortedByField(field, Sort.asc)
			})

			it(`[${roleWithReadUser}]. should return 200 with field ${field} sorted desc`, async () => {
				await testUsersSortedByField(field, Sort.desc)
			})
		})

		it(`[${roleWithReadUser}]. should return 400 when sort field is invalid`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithReadUser)

			const sortField = 'invalidSortField'

			// Action
			const result = await apiRequest
				.get('/api/users')
				.query({field: sortField})
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})

		it(`[${roleWithReadUser}]. should return 400 when pagination field in invalid`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithReadUser)
			const badOffset = 'a'
			const badLimit = 0

			// Action
			const result = await apiRequest
				.get('/api/users')
				.query({offset: badOffset, limit: badLimit})
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
			expect(result.body)
		})

		it(`[${roleWithReadUser}]. should return 200 with pagination offset 0 and limit 2`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithReadUser)
			const offset = 0
			const limit = 2

			// Action
			const result = await apiRequest
				.get('/api/users')
				.query({offset, limit})
				.set('Authorization', token)

			const {records} = result.body.data

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(records.length).toEqual(limit)
		})
	})

	describe('DELETE /api/users/:id', () => {
		it(`[${roleWithWriteUser}]. should return 200 with deleted user`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithWriteUser)

			// Action
			const result = await apiRequest
				.del(`/api/users/${dummyUser.id}`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data).toEqualUser(dummyUser)
		})

		it(`[${roleWithWriteUser}]. should return 404 when delete user not found`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithWriteUser)
			const mockId = createMockId()

			// Action
			const res = await apiRequest
				.del(`/api/users/${mockId}`)
				.set('Authorization', token)

			// Expect
			expect(res.status).toEqual(httpStatus.NOT_FOUND)
		})

		it(`[${roleWithoutWriteUser}]. should return 401 when user does not have WriteUser permission`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithoutWriteUser)

			// Action
			const result = await apiRequest
				.del(`/api/users/${dummyUser.id}`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.FORBIDDEN)
		})
	})

	describe('PUT /api/users/:id', () => {
		it(`[${roleWithWriteUser}]. should return 200 with updated user`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithWriteUser)
			const {firstName, lastName} = createMockUser(UserRole.Admin)

			const updatedInfo = {firstName, lastName}
			const updatedUser = _.merge(dummyUser, updatedInfo)

			// Action
			const result = await apiRequest
				.put(`/api/users/${dummyUser.id}`)
				.set('Authorization', token)
				.send(updatedInfo)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data).toEqualUser(updatedUser)
		})

		it(`[${roleWithWriteUser}]. should return 404 when updated user not found`, async () => {
			// Arrange
			const mockId = createMockId()
			const {token} = findUserWithRoleAndSignIn(users, roleWithWriteUser)

			// Action
			const res = await apiRequest
				.put(`/api/users/${mockId}`)
				.set('Authorization', token)

			// Expect
			expect(res.status).toEqual(httpStatus.NOT_FOUND)
		})

		it(`[${roleWithoutWriteUser}]. should return 401 when user does not have WriteUser permission`, async () => {
			// Arrange
			const {token} = findUserWithRoleAndSignIn(users, roleWithoutWriteUser)

			// Action
			const result = await apiRequest
				.put(`/api/users/${dummyUser.id}`)
				.set('Authorization', token)

			// Expect
			expect(result.status).toEqual(httpStatus.FORBIDDEN)
		})

		const testNotAllowedUpdateFields = (updateField: string) => {
			it(`[${roleWithWriteUser}]. should return 400 when try to update ${updateField}`, async () => {
				// Arrange
				const {token, user} = findUserWithRoleAndSignIn(
					users,
					roleWithWriteUser,
				)

				const updateData = {
					[updateField]: faker.random.word(),
				}

				// Action
				const result = await apiRequest
					.put(`/api/users/${user.id}`)
					.set('Authorization', token)
					.send(updateData)

				// Expect
				expect(result.status).toEqual(httpStatus.BAD_REQUEST)
			})
		}

		notAllowedUpdateUserFields.forEach(testNotAllowedUpdateFields)
	})

	describe('PUT /api/users/me', () => {
		it(`[${roleWithWriteUser}]. should return 200 with my updated profile`, async () => {
			// Arrange
			const {token, user} = findUserWithRoleAndSignIn(users, roleWithReadUser)
			const {firstName, lastName} = createMockUser()

			const updatedInfo = {firstName, lastName}
			const updatedUser = _.merge(user, updatedInfo)

			// Action
			const result = await apiRequest
				.put(`/api/users/me`)
				.set('Authorization', token)
				.send(updatedInfo)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
			expect(result.body.data).toEqualUser(updatedUser)
		})

		const testNotAllowedUpdateFields = (updateField: string) => {
			it(`[${roleWithoutWriteUser}]. should return 400 when user updates their ${updateField}`, async () => {
				// Arrange
				const {token} = findUserWithRoleAndSignIn(users, roleWithoutWriteUser)
				const updateData = {
					[updateField]: faker.random.word(),
				}

				// Action
				const result = await apiRequest
					.put('/api/users/me')
					.set('Authorization', token)
					.send(updateData)

				// Expect
				expect(result.status).toEqual(httpStatus.BAD_REQUEST)
			})
		}
		notAllowedUpdateMeFields.forEach(testNotAllowedUpdateFields)
	})

	describe('Authentication and Authorization', () => {
		it('should return 401 when there is no token', async () => {
			// Arrange
			const mockId = createMockId()

			// Action
			const results = await Promise.all([
				apiRequest.get('/api/users'),
				apiRequest.get('/api/users/me'),
				apiRequest.put('/api/users/me'),
				apiRequest.get(`/api/users/${mockId}`),
				apiRequest.put(`/api/users/${mockId}`),
				apiRequest.delete(`/api/users/${mockId}`),
			])

			// Expect
			results.forEach(res =>
				expect(res.status).toEqual(httpStatus.UNAUTHORIZED),
			)
		})

		const testAuthorization = (userStatus: UserStatus) => {
			it(`should return 403 when user status is ${userStatus}`, async () => {
				// Arrange
				const mockId = createMockId()

				const noAccessRightUser = await addUser(
					createMockUser(undefined, userStatus),
				)
				const noAccessRightToken = signInUser(noAccessRightUser)

				// Action
				const results = await Promise.all([
					apiRequest.get('/api/users').set('Authorization', noAccessRightToken),
					apiRequest
						.put('/api/users/me')
						.set('Authorization', noAccessRightToken),
					apiRequest
						.get(`/api/users/${mockId}`)
						.set('Authorization', noAccessRightToken),
					apiRequest
						.put(`/api/users/${mockId}`)
						.set('Authorization', noAccessRightToken),
					apiRequest
						.delete(`/api/users/${mockId}`)
						.set('Authorization', noAccessRightToken),
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
})
