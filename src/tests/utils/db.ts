import {UserRole, UserStatus, User} from '../../resources/user/user.interface'
import UserModel, {UserDocument} from '../../resources/user/user.model'
import TeamModel, {TeamDocument} from '../../resources/team/team.model'
import {createMockUser} from './mock'
import {Team} from '../../resources/team/team.interface'

export const addUser = (user: User): Promise<UserDocument> => {
	const mockUser = user || createMockUser(UserRole.User, UserStatus.Active)

	mockUser.status = mockUser.status || UserStatus.Active

	const newUser = new UserModel(mockUser)
	return newUser.save()
}

export const addTeam = async (team: Team): Promise<TeamDocument> => {
	const mockTeam = team

	const newTeam = await TeamModel.create(mockTeam)
	const user = await UserModel.findById(team.creator)
	user.teams.push(newTeam.id)
	await user.save()

	return newTeam
}
