import {addUser} from '../../utils/db'
import {createMockTeam, createMockUser} from '../../utils/mock'
import {createOne, getByUserId} from '../../../resources/team/team.service'
import {UserDocument} from '../../../resources/user/user.model'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {Team} from '../../../resources/team/team.interface'

describe('[Team service]', () => {
	let team: Team
	let user: UserDocument

	beforeEach(async done => {
		user = await addUser(createMockUser(UserRole.User, UserStatus.Active))
		team = await createMockTeam()
		done()
	})

	describe('createOne', () => {
		it('should return correct team and add save team id to user', async () => {
			try {
				// Action
				const createdTeam = await createOne(team, user._id)

				// Expect
				expect(createdTeam.name).toEqual(team.name)
				expect(createdTeam.creatorId).toEqual(user._id.toString())
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})

	describe('getByUserId', () => {
		it('should return all teams that user belongs to', async () => {
			try {
				// Action
				await createOne(team, user._id)
				const teams = await getByUserId(user._id)

				// Expect
				expect(teams.length).toEqual(1)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})
})
