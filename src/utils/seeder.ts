import {User, UserRole, UserStatus} from '../resources/user/user.interface'
import _ from 'lodash'
import UserModel from '../resources/user/user.model'
import createLogger from '../utils/logger'
import {createMockTeam} from '../tests/utils/mock'
import TeamModel from '../resources/team/team.model'
import {addTeam, addUser} from '../tests/utils/db'

const logger = createLogger(module)

const mockUser1: User = {
	firstName: 'fName1',
	lastName: 'lName1',
	email: 'user@gmail.com',
	passport: {
		password: '123456',
	},
	role: UserRole.User,
	status: UserStatus.Active,
}

const mockUser2: User = {
	firstName: 'fName2',
	lastName: 'lName2',
	email: 'admin@gmail.com',
	passport: {
		password: '123456',
	},
	role: UserRole.Admin,
	status: UserStatus.Active,
}

const mockUsers = [mockUser1, mockUser2]

const cleanDB = async () => {
	return Promise.all([UserModel.deleteMany({}), TeamModel.deleteMany({})])
}

const createUsers = () => {
	return mockUsers.map(mockUser => addUser(mockUser))
}

const createTeams = (creatorId: string) => {
	const mockTeams = _.times(6, () => createMockTeam(creatorId))

	return mockTeams.map(mockTeam => addTeam(mockTeam))
}

export const seed = async () => {
	try {
		await cleanDB()

		logger.debug(`Database cleaned`)

		const users = await Promise.all(createUsers())

		await Promise.all(users.map(user => createTeams(user.id)).flat())

		logger.debug(`Database seeded`)
	} catch (e) {
		logger.error('Seed database error: ‰o', e)
	}
}
