import {UserDocument} from '../../../resources/user/user.model'
import {addUser, addTeam} from '../../utils/db'
import {createMockId, createMockUser, createMockTeam} from '../../utils/mock'
import {getUserById} from '../../../resources/user/user.service'
import {ApiError} from '../../../utils/apiError'
import {Team} from '../../../resources/team/team.interface'
import {getMyTeams} from '../../../resources/user/user.service'

describe('[User Service]', () => {
	let user: UserDocument
	let userTeams: Team[]

	beforeEach(async done => {
		// Arrange
		user = await addUser(createMockUser())
		const otherUser = await addUser(createMockUser())
		const [team1, team2] = await Promise.all([
			addTeam(createMockTeam(user.id)),
			addTeam(createMockTeam(user.id)),
			addTeam(createMockTeam(otherUser.id)),
		])
		userTeams = [team1, team2]
		done()
	})

	describe('getUserById', () => {
		it('should return correct user', async () => {
			try {
				// Action
				const foundUser = await getUserById(user.id)

				// Expect
				expect(foundUser).toEqualUser(user)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})

		it('should return error when user not found', async () => {
			try {
				// Arrange
				const mockId = createMockId()

				// Action
				const foundUser = await getUserById(mockId)

				// Expect
				expect(foundUser).toBeUndefined()
			} catch (e) {
				expect(e).toBeInstanceOf(ApiError)
			}
		})
	})

	describe('getMyTeams', () => {
		it('should return all teams that user belongs to', async () => {
			try {
				// Action
				const teams = await getMyTeams(user.id)

				// Expect
				expect(teams.length).toEqual(userTeams.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})
})
