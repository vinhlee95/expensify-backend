import TeamModel, {TeamDocument} from './team.model'

// Services
import * as userServices from '../user/user.service'

// Utils
import createLogger from '../../utils/logger'
import apiError from '../../utils/apiError'
const logger = createLogger(module)


interface teamData {
	name: string
	description?: string
}
/**
 * Create new team
 *
 * @param teamData
 * @param userId
 */
export const createOne = async (teamData: teamData, userId: string): Promise<TeamDocument> => {
	logger.debug(`Create new team: %o`, teamData)

	const newTeam = await TeamModel.create(teamData)
	const teamId = newTeam._id

	// Save team id to user object
	const user = await userServices.getUserById(userId)
	user.teamId.push(teamId)
	await user.save()

	return newTeam
}