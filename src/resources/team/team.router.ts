import {Router} from 'express'
import {Permission, protect} from '../../middlewares/permission'

import {
	validateGetCategories,
	validateCreateCategory,
	validateUpdateCategory,
	checkTeamCreator,
} from './team.validator'
import * as teamController from './team.controller'

const router = Router()

const readCategory = protect([Permission.ReadCategory])
const writeCategory = protect([Permission.WriteCategory])

router.param('categoryId', teamController.parseCategoryIdParam)

router.param('id', teamController.parseTeamIdParam)

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

/**
 * @swagger
 *
 * /api/teams/{id}/categories/{categoryId}:
 *   parameters:
 *     - $ref: '#/components/parameters/id'
 *     - $ref: '#/components/parameters/categoryId'
 */
router
	.route('/:id/categories/:categoryId')
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/categories/{categoryId}:
	 *   delete:
	 *     tags:
	 *       - Team
	 *     summary: Delete a category
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/CategoryResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.delete(writeCategory, checkTeamCreator, teamController.deleteCategory)
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/categories/{categoryId}:
	 *   put:
	 *     tags:
	 *       - Team
	 *     summary: Update a category
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/CategoryUpdate'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/CategoryResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.put(
		writeCategory,
		checkTeamCreator,
		validateUpdateCategory(),
		teamController.updateCategory,
	)

export default router
