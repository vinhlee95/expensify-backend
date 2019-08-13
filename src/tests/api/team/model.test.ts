import faker from 'faker'
import {Error} from 'mongoose'
import {Team} from '../../../resources/team/team.interface'
import {createMockTeam, createMockUser} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {UserDocument} from '../../../resources/user/user.model'
import {addUser} from '../../utils/db'
import TeamModel from '../../../resources/team/team.model'

describe('[Team Model]', () => {
	// const requiredFields = ['name', 'creator']

	let mockUser: UserDocument
	let mockTeam: Team

	beforeEach(async () => {
		mockUser = await addUser(createMockUser(UserRole.User, UserStatus.Active))
		mockTeam = createMockTeam(mockUser.id)
	})

	it('should create new team when team data is valid', async () => {
		// Action
		const createdTeam = await TeamModel.create(mockTeam)

		// Expect
		expect(createdTeam.name).toEqual(mockTeam.name)
		expect(createdTeam.description).toEqual(mockTeam.description)
		expect(createdTeam.creator.toString()).toEqual(mockTeam.creator)
	})

	it('should throw error when there is no team name', async () => {
		const teamWithoutName = {
			description: faker.lorem.sentence(),
			creator: faker.random.uuid,
		}

		const createdTeam = TeamModel.create(teamWithoutName)
		await expect(createdTeam).rejects.toThrow(Error)
	})

	it('should throw error when there is no team creator', async () => {
		const teamWithoutCreator = {
			name: faker.internet.userName(),
			description: faker.lorem.sentence(),
		}

		const createdTeam = TeamModel.create(teamWithoutCreator)
		await expect(createdTeam).rejects.toThrow(Error)
	})
})
