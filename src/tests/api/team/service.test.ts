import {TeamDocument} from '../../../resources/team/team.model'
import {addTeam, addUser} from '../../utils/db'
import {createMockTeam, createMockUser} from '../../utils/mock'
import {createOne} from '../../../resources/team/team.service'
import {UserDocument} from '../../../resources/user/user.model'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {getUserById} from '../../../resources/user/user.service'

describe('[Team service]', () => {
	let team: TeamDocument
	let user: UserDocument

	beforeEach(async done => {
		user = await addUser(createMockUser(UserRole.User, UserStatus.Active))
		team = await addTeam(createMockTeam())
		done()
	})

	describe('createOne', () => {
		it('should return correct team and add save team id to user', async () => {
			try {
				// Action
				const createdTeam = await createOne(team, user._id)
				const updatedUser = await getUserById(user._id)

				// Expect
				expect(createdTeam.name).toEqual(team.name)
				expect(updatedUser.teamIds[0]).toEqual(team._id)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})
})
