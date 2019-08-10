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

	const newTeam = await TeamModel.create(teamData)
	const teamIds = newTeam._id

	// Save team id to user object
	const user = await UserModel.findById(userId)
	user.teamIds.push(teamIds)
	await user.save()

	return newTeam
}
