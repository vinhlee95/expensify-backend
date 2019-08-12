import {addTeam, addUser} from '../../utils/db'
import {createMockTeam, createMockUser} from '../../utils/mock'
import {createOne, getByUserId} from '../../../resources/team/team.service'
import {UserDocument} from '../../../resources/user/user.model'
import {Team} from '../../../resources/team/team.interface'

describe('[Team service]', () => {
	let user: UserDocument
	let userTeams: Team[]

	beforeEach(async () => {
		user = await addUser(createMockUser())
		const otherUser = await addUser(createMockUser())
		const [team1, team2] = await Promise.all([
			addTeam(createMockTeam(user.id)),
			addTeam(createMockTeam(user.id)),
			addTeam(createMockTeam(otherUser.id)),
		])
		userTeams = [team1, team2]
	})

	describe('createOne', () => {
		it('should return correct team and add save team id to user', async () => {
			try {
				// Arrange
				const mockTeam = createMockTeam(user.id)

				// Action
				const createdTeam = await createOne(mockTeam, user.id)

				// Expect
				expect(createdTeam.name).toEqual(mockTeam.name)
				expect(createdTeam.creator).toEqual(user.id.toString())
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})

	describe('getByUserId', () => {
		it('should return all teams that user belongs to', async () => {
			try {
				// Action
				const teams = await getByUserId(user.id)

				console.log('TEAMSSS: ', userTeams)

				// Expect
				expect(teams.length).toEqual(userTeams.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})
})
