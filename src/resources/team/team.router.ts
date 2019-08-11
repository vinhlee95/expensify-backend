import {Router} from 'express'
import {Permission, protect} from '../../middlewares/permission'

import {validateCreateTeam, validateGetTeam} from './team.validator'
import * as teamController from './team.controller'

const router = Router()

const writeTeam = protect([Permission.WriteTeam])
const readTeam = protect([Permission.ReadTeam])

// POST request to create a new team
router
	/**
	 * @swagger
	 *
	 * /api/teams:
	 *   post:
	 *     tags:
	 *       - Team
	 *     summary: Create a new team
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/TeamCreate'
	 *     responses:
	 *       '201':
	 *         $ref: '#/components/responses/TeamResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.route('/')
	.get(readTeam, validateGetTeam(), teamController.getByUserId)
	.post(writeTeam, validateCreateTeam(), teamController.createOne)

export default router
