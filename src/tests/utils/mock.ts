import faker from 'faker'
import {Types} from 'mongoose'
import {normalizeEmail} from 'validator'

import {User, UserRole, UserStatus} from '../../resources/user/user.interface'
import {Team} from '../../resources/team/team.interface'
import {
	Category,
	CategoryType,
} from '../../resources/category/category.interface'

export const createMockId = () => {
	const ObjectId = Types.ObjectId
	const id = new ObjectId()
	return id.toHexString()
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

export const createMockTeam = (creatorId: string): Team => ({
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
