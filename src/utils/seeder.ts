import {User, UserRole, UserStatus} from '../resources/user/user.interface'
import _ from 'lodash'
import UserModel from '../resources/user/user.model'
import createLogger from '../utils/logger'
import {
	createMockCategory,
	createMockItem,
	createMockTeam,
} from '../tests/utils/mock'
import TeamModel from '../resources/team/team.model'
import ItemModel from '../resources/item/item.model'
import {addCategory, addItem, addTeam, addUser} from '../tests/utils/db'
import {CategoryType} from '../resources/category/category.interface'
import CategoryModel from '../resources/category/category.model'

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
	return Promise.all([
		UserModel.deleteMany({}),
		TeamModel.deleteMany({}),
		CategoryModel.deleteMany({}),
		ItemModel.deleteMany({}),
	])
}

const createUsers = () => {
	return mockUsers.map(mockUser => addUser(mockUser))
}

const createTeams = (creatorId: string) => {
	const mockTeams = _.times(2, () => createMockTeam(creatorId))

	return mockTeams.map(mockTeam => addTeam(mockTeam))
}

const createCategories = (teamId: string) => {
	const mockExpenseCategories = _.times(4, () =>
		createMockCategory(teamId, CategoryType.Expense),
	)
	const mockIncomeCategories = _.times(2, () =>
		createMockCategory(teamId, CategoryType.Income),
	)
	const mockCategories = [...mockExpenseCategories, ...mockIncomeCategories]

	return mockCategories.map(mockCategory => addCategory(mockCategory))
}

const createItems = (teamId: string, userId: string, categoryId: string) => {
	const items = _.times(10, () => createMockItem(teamId, userId, categoryId))

	return items.map(item => addItem(item))
}

export const seed = async () => {
	try {
		await cleanDB()

		logger.debug(`Database cleaned`)

		const users = await Promise.all(createUsers())

		const teams = await Promise.all(
			users.map(user => createTeams(user.id)).flat(),
		)

		const categories = await Promise.all(
			teams.map(team => createCategories(team.id)).flat(),
		)

		teams.map(async team => {
			await Promise.all(
				categories
					.map(category => createItems(team.id, users[0].id, category.id))
					.flat(),
			)
		})

		logger.debug(`Database seeded`)
	} catch (e) {
		logger.error('Seed database error: ‰o', e)
	}
}
