import {Router} from 'express'
import {Permission, protect} from '../../middlewares/permission'

import {validateCreateTeam} from './team.validator'
import * as teamController from './team.controller'

const router = Router()

const writeUser = protect([Permission.UserWrite])

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
	.post(
		writeUser,
		validateCreateTeam(),
		teamController.createOne
	)


export default router