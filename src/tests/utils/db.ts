import {UserRole, UserStatus, User} from '../../resources/user/user.interface'
import UserModel, {UserDocument} from '../../resources/user/user.model'
import TeamModel, {TeamDocument} from '../../resources/team/team.model'
import {createMockUser, createMockTeam} from './mock'
import {Team} from '../../resources/team/team.interface'

export const addUser = (user: User): Promise<UserDocument> => {
	const mockUser = user || createMockUser(UserRole.User, UserStatus.Active)

	mockUser.status = mockUser.status || UserStatus.Active

	const newUser = new UserModel(mockUser)
	return newUser.save()
}

export const addTeam = (team: Team): Promise<TeamDocument> => {
	const mockTeam = team || createMockTeam()

	const creator = 
	const newTeam = new TeamModel(mockTeam)
	return newTeam.save()
}
