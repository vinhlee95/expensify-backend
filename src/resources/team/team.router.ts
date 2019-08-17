import {Router} from 'express'
import {Permission, protect} from '../../middlewares/permission'

import {
	validateCreateTeam,
	validateGetCategories,
	validateCreateCategory,
} from './team.validator'
import * as teamController from './team.controller'

const router = Router()

const writeTeam = protect([Permission.WriteTeam])
const readCategory = protect([Permission.ReadCategory])
const writeCategory = protect([Permission.WriteCategory])

router
	.route('/')
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
	.post(writeTeam, validateCreateTeam(), teamController.createOne)

/**
 * @swagger
 *
 * /api/teams/{id}/categories:
 *   parameters:
 *     - $ref: '#/components/parameters/id'
 */

router
	.route('/:id/categories')
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/categories:
	 *   get:
	 *     tags:
	 *       - Team
	 *     summary: Get all categories for a team
	 *     parameters:
	 *     - $ref: '#/components/parameters/type'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/CategoriesResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.get(readCategory, validateGetCategories(), teamController.getCategories)
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/categories:
	 *   post:
	 *     tags:
	 *       - Team
	 *     summary: Create a new category
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/CategoryCreate'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/CategoryResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.post(writeCategory, validateCreateCategory(), teamController.createCategory)

export default router
