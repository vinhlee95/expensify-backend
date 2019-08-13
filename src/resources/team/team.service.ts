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
export const createOne = async (teamData: Team): Promise<TeamDocument> => {
	logger.debug(`Create new team: %o`, teamData)

	const newTeam = await TeamModel.create(teamData)

	// Save team id to user object
	const user = await UserModel.findById(teamData.creator)
	user.teams.push(newTeam.id)
	await user.save()

	return Promise.resolve(newTeam)
}
