import faker from 'faker'
import {Types} from 'mongoose'
import {normalizeEmail} from 'validator'

import {User, UserRole, UserStatus} from '../../resources/user/user.interface'
import {TeamInput} from '../../resources/team/team.interface'
import {
	Category,
	CategoryType,
} from '../../resources/category/category.interface'
import {slugify} from '../../utils/util'
import ExpenseItem from '../../resources/expenseItem/expenseItem.interface'

export const createMockId = () => {
	const ObjectId = Types.ObjectId
	const id = new ObjectId()
	return id.toHexString()
}

export const createMockSlug = () => {
	const teamName = faker.random.word()
	return slugify(teamName)
}

export const createMockUser = (
	role: UserRole = UserRole.User,
	status: UserStatus = UserStatus.Active,
): User => ({
	firstName: faker.name.firstName(),
	lastName: faker.name.lastName(),
	email: normalizeEmail(faker.internet.email()) as string,
	passport: {
		password: faker.internet.password(),
	},
	role,
	status,
})

export const createMockTeam = (creatorId: string): TeamInput => ({
	name: faker.internet.userName(),
	description: faker.lorem.sentence(),
	creator: creatorId,
})

export const createMockCategory = (
	teamId: string,
	type = CategoryType.Expense,
): Category => ({
	name: faker.random.word(),
	description: faker.lorem.sentence(),
	type,
	team: teamId,
})

export const createMockExpenseItem = (
	teamId: string,
	creatorId: string,
	categoryId: string,
): ExpenseItem => ({
	name: faker.random.word(),
	note: faker.lorem.sentence(),
	date: faker.date.recent(),
	quantity: faker.random.number({
		min: 1,
	}),
	price: faker.random.number({
		min: 1,
	}),
	category: categoryId,
	team: teamId,
	creator: creatorId,
})
