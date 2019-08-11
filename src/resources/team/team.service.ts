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
	const teamIds = newTeam._id

	// Save team id to user object
	const user = await UserModel.findById(userId)
	user.teamIds.push(teamIds)
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

	let query = UserModel.findOne({_id: userId})
	query.populate({path: 'teams', select: 'name description'})
	query.lean()
	const data = await query.exec()

	return Promise.resolve(data.teams)
}
