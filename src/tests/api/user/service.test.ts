import faker from 'faker'
import UserModel, {UserDocument} from '../../../resources/user/user.model'
import {addUser, addTeam} from '../../utils/db'
import {createMockId, createMockUser, createMockTeam} from '../../utils/mock'
import {
	getUserById,
	getTeamBySlug,
	createTeam,
} from '../../../resources/user/user.service'
import {ApiError} from '../../../utils/apiError'
import {Team} from '../../../resources/team/team.interface'
import {getMyTeams} from '../../../resources/user/user.service'
import TeamModel from '../../../resources/team/team.model'

describe('[User Service]', () => {
	let user: UserDocument
	let userTeams: Team[]

	beforeEach(async done => {
		// Arrange
		user = await addUser(createMockUser())
		const otherUser = await addUser(createMockUser())
		const [team1, team2] = await Promise.all([
			addTeam(createMockTeam(user.id)),
			addTeam(createMockTeam(user.id)),
			addTeam(createMockTeam(otherUser.id)),
		])
		userTeams = [team1, team2]
		done()
	})

	describe('createTeam', () => {
		it('should return correct team and add save team id to user', async () => {
			try {
				// Arrange
				const mockTeam = createMockTeam(user.id)

				// Action
				const createdTeam = await createTeam(mockTeam)

				// Expect
				expect(createdTeam.name).toEqual(mockTeam.name)
				expect(createdTeam.creator.toString()).toEqual(user.id)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})

	describe('getTeamBySlug', () => {
		it('should return correct team with slug', async () => {
			try {
				// Arrange
				const savedUser = await UserModel.findById(user.id)
				const savedTeam = await TeamModel.findById(savedUser.teams[0])

				// Action
				const foundTeam = await getTeamBySlug(savedTeam.slug, savedUser)

				// Expect
				expect(foundTeam.name).toEqual(savedTeam.name)
				expect(foundTeam.description).toEqual(savedTeam.description)
				expect(foundTeam.slug).toEqual(savedTeam.slug)
				expect(foundTeam.id).toEqual(savedTeam.id)
				expect(foundTeam.creator).toEqual(savedTeam.creator)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})

		it('should return error when slug not found', async () => {
			try {
				// Arrange
				const mockSlug = faker.random.word()
				// Action
				const foundTeam = await getTeamBySlug(mockSlug, user)
				// Expect
				expect(foundTeam).toBeUndefined()
			} catch (e) {
				expect(e).toBeInstanceOf(ApiError)
			}
		})
	})

	describe('getUserById', () => {
		it('should return correct user', async () => {
			try {
				// Action
				const foundUser = await getUserById(user.id)

				// Expect
				expect(foundUser).toEqualUser(user)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})

		it('should return error when user not found', async () => {
			try {
				// Arrange
				const mockId = createMockId()

				// Action
				const foundUser = await getUserById(mockId)

				// Expect
				expect(foundUser).toBeUndefined()
			} catch (e) {
				expect(e).toBeInstanceOf(ApiError)
			}
		})
	})

	describe('getMyTeams', () => {
		it('should return all teams that user belongs to', async () => {
			try {
				// Action
				const teams = await getMyTeams(user.id)

				// Expect
				expect(teams.length).toEqual(userTeams.length)
			} catch (e) {
				expect(e).toBeUndefined()
			}
		})
	})
})
