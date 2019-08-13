import {addUser} from '../../utils/db'
import {createMockTeam, createMockUser} from '../../utils/mock'
import {createOne} from '../../../resources/team/team.service'
import {UserDocument} from '../../../resources/user/user.model'

describe('[Team service]', () => {
	let user: UserDocument

	beforeEach(async () => {
		user = await addUser(createMockUser())
	})

	describe('createOne', () => {
		it('should return correct team and add save team id to user', async () => {
			try {
				// Arrange
				const mockTeam = createMockTeam(user.id)

				// Action
				const createdTeam = await createOne(mockTeam)

				// Expect
				expect(createdTeam.name).toEqual(mockTeam.name)
				expect(createdTeam.creator.toString()).toEqual(user.id)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})
})
