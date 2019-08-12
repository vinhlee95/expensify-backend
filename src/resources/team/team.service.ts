import TeamModel, {TeamDocument} from './team.model'
import {Team} from './team.interface'
import UserModel from '../user/user.model'

// Utils
import createLogger from '../../utils/logger'
const logger = createLogger(module)

/**
 * Create new team
 *
 * @param teamData
 * @param userId
 */
export const createOne = async (
	teamData: Team,
	userId: string,
): Promise<TeamDocument> => {
	logger.debug(`Create new team: %o`, teamData)

	const newTeam = await TeamModel.create({...teamData, creatorId: userId})
	const teamIds = newTeam.id

	// Save team id to user object
	const user = await UserModel.findById(userId)
	user.teams.push(teamIds)
	await user.save()

	return Promise.resolve(newTeam)
}

/**
 * Get teams by user id
 *
 * @param userId
 */
export const getByUserId = async (userId: string): Promise<[TeamDocument]> => {
	logger.debug(`Get teams by user id: %o`, userId)

	const teams = await UserModel.findById(userId)
		.populate('teams')
		.lean()
		.exec()

	const allTeams = await TeamModel.find({}).exec()

	console.log('TEAMS: ', teams)
	console.log('ALL TEAMS: ', allTeams)

	return Promise.resolve(teams)
}
