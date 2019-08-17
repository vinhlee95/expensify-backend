import TeamModel, {TeamDocument} from './team.model'
import {TeamInput} from './team.interface'
import UserModel from '../user/user.model'

// Utils
import createLogger from '../../utils/logger'
import {slugify} from '../../utils/util'

const logger = createLogger(module)

/**
 * Create new team
 *
 * @param teamData
 * @param userId
 */
export const createOne = async (teamData: TeamInput): Promise<TeamDocument> => {
	logger.debug(`Create new team: %o`, teamData)

	const newTeam = await TeamModel.create({
		...teamData,
		slug: slugify(teamData.name),
	})

	// Save team id to user object
	const user = await UserModel.findById(teamData.creator)
	user.teams.push(newTeam.id)
	await user.save()

	return Promise.resolve(newTeam)
}
