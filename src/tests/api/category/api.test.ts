import faker from 'faker'
import httpStatus from 'http-status'
import {getRoleWithPermisison, signInUser, apiRequest} from '../../utils/common'
import {Permission} from '../../../middlewares/permission'
import {UserDocument} from '../../../resources/user/user.model'
import {addUser, addTeam} from '../../utils/db'
import {createMockUser, createMockTeam, createMockCategory} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'

describe('[CATEGORIES API]', () => {
	const roleWithReadCategory = getRoleWithPermisison(Permission.ReadCategory)
	const roleWithWriteCategory = getRoleWithPermisison(Permission.WriteCategory)

	let user: UserDocument
	let team: TeamDocument
	let token: string

	beforeEach(async () => {
		user = await addUser(createMockUser(UserRole.User))
		team = await addTeam(createMockTeam(user.id))
		token = signInUser(user)
	})

	describe('POST /api/categories', () => {
		it(`[${roleWithWriteCategory}]. should return 400 with wrong or no category type`, async () => {
			const randomTypeCategory = createMockCategory(faker.random.word(), team.id)
			const noTypeCategory = {
				name: faker.random.word(),
				teamId: team.id
			}

			// Action
			const results = await Promise.all([
				apiRequest
				.post('/api/categories')
				.set('Authorization', token)
				.send(randomTypeCategory),
				apiRequest
				.post('/api/categories')
				.set('Authorization', token)
				.send(noTypeCategory),
			])

			// Expect
			results.forEach(result => {
				expect(result.status).toEqual(httpStatus.BAD_REQUEST)
			})
		})

		it(`[${roleWithWriteCategory}]. should return 400 with wrong category type`, async () => {
			const mockCategory = createMockCategory(faker.random.word(), team.id)
			// Action
			const result = await apiRequest
				.post('/api/categories')
				.set('Authorization', token)
				.send(mockCategory)

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})

		it(`[${roleWithWriteCategory}]. should return 400 when user does not belong to provided team`, async () => {
			const noMemberUser = await addUser(createMockUser(UserRole.User, UserStatus.Active))
			const token = signInUser(noMemberUser)
			const mockCategory = createMockCategory(CategoryType.Expense, team.id)

			// Action
			const result = await apiRequest
				.post('/api/categories')
				.set('Authorization', token)
				.send(mockCategory)

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})

		it(`[${roleWithWriteCategory}]. should return 200 with new created category when data is valid`, async () => {
			const mockCategory = createMockCategory(CategoryType.Expense, team.id)
			// Action
			const result = await apiRequest
				.post('/api/categories')
				.set('Authorization', token)
				.send(mockCategory)

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
		})
	})

	describe('GET /api/categories', () => {
		it(`[${roleWithReadCategory}]. should return 400 with wrong category type`, async () => {
			// Action
			const result = await apiRequest
				.get('/api/categories')
				.set('Authorization', token)
				.query({
					type: faker.random.word,
					teamId: team.id,
				})

			// Expect
			expect(result.status).toEqual(httpStatus.BAD_REQUEST)
		})

		it(`[${roleWithReadCategory}]. should return 200 with a list of categories`, async () => {
			// Action
			const result = await apiRequest
				.get('/api/categories')
				.set('Authorization', token)
				.query({
					type: CategoryType.Income,
					teamId: team.id,
				})

			// Expect
			expect(result.status).toEqual(httpStatus.OK)
		})
	})
})
