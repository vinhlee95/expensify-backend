import {User, UserRole, UserStatus} from '../resources/user/user.interface'
import _ from 'lodash'
import UserModel from '../resources/user/user.model'
import createLogger from '../utils/logger'
import {createMockCategory, createMockTeam} from '../tests/utils/mock'
import TeamModel from '../resources/team/team.model'
import {addCategory, addTeam, addUser} from '../tests/utils/db'
import {CategoryType} from '../resources/category/category.interface'

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

const createCategory = (teamId: string) => {
	const mockExpenseCategory = _.times(4, () =>
		createMockCategory(teamId, CategoryType.Expense),
	)
	const mockIncomeCategory = _.times(4, () =>
		createMockCategory(teamId, CategoryType.Income),
	)
	const mockCategories = [...mockExpenseCategory, ...mockIncomeCategory]

	console.log('mock categories: ', mockCategories)

	return mockCategories.map(mockCategory => addCategory(mockCategory))
}

export const seed = async () => {
	try {
		await cleanDB()

		logger.debug(`Database cleaned`)

		const users = await Promise.all(createUsers())

		const teams = await Promise.all(
			users.map(user => createTeams(user.id)).flat(),
		)

		await Promise.all(teams.map(team => createCategory(team.id)).flat())

		logger.debug(`Database seeded`)
	} catch (e) {
		logger.error('Seed database error: ‰o', e)
	}
}
