import faker from 'faker'
import httpStatus from 'http-status'
import {getRoleWithPermisison, signInUser, apiRequest} from '../../utils/common'
import {Permission} from '../../../middlewares/permission'
import {UserDocument} from '../../../resources/user/user.model'
import {addUser, addTeam} from '../../utils/db'
import {createMockUser, createMockTeam} from '../../utils/mock'
import {UserRole} from '../../../resources/user/user.interface'
import {TeamDocument} from '../../../resources/team/team.model'
import {CategoryType} from '../../../resources/category/category.interface'

describe('[CATEGORIES API]', () => {
	const roleWithReadCategory = getRoleWithPermisison(Permission.ReadCategory)

	let user: UserDocument
	let team: TeamDocument
	let token: string

	beforeEach(async () => {
		user = await addUser(createMockUser(UserRole.User))
		team = await addTeam(createMockTeam(user.id))
		token = signInUser(user)
	})

	describe('GET /api/categories', () => {
		it(`[${roleWithReadCategory}]. should return 400 with wrong category type`, async () => {
			// Action
			const result = await apiRequest
				.get('/api/categories')
				.set('Authorization', token)
				.query({
					category: faker.random.word,
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
