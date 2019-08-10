import TeamModel, {TeamDocument} from './team.model'

// Services
import * as userServices from '../user/user.service'

// Utils
import createLogger from '../../utils/logger'
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
export const createOne = async (
	teamData: teamData,
	userId: string,
): Promise<TeamDocument> => {
	logger.debug(`Create new team: %o`, teamData)

	const newTeam = await TeamModel.create(teamData)
	const teamIds = newTeam._id

	// Save team id to user object
	const user = await userServices.getUserById(userId)
	user.teamIds.push(teamIds)
	await user.save()

	return newTeam
}
