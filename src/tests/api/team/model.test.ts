import faker from 'faker'
import {Error} from 'mongoose'
import {TeamInput} from '../../../resources/team/team.interface'
import {createMockTeam, createMockUser} from '../../utils/mock'
import {UserRole, UserStatus} from '../../../resources/user/user.interface'
import {UserDocument} from '../../../resources/user/user.model'
import {addUser} from '../../utils/db'
import TeamModel from '../../../resources/team/team.model'
import {slugify} from '../../../utils/util'

describe('[Team Model]', () => {
	it('should create new team when team data is valid', async () => {
		// Action
		const user: UserDocument = await addUser(
			createMockUser(UserRole.User, UserStatus.Active),
		)
		const mockTeam: TeamInput = createMockTeam(user.id)
		const createdTeam = await TeamModel.create({
			...mockTeam,
			slug: slugify(mockTeam.name),
		})

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
