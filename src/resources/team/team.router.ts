import {Router} from 'express'
import {Permission, protect} from '../../middlewares/permission'

import {validateGetCategories, validateCreateCategory} from './team.validator'
import * as teamController from './team.controller'
import CategoryModel from '../category/category.model'
import {notFound} from '../../utils/apiError'
import TeamModel from './team.model'

const router = Router()

const readCategory = protect([Permission.ReadCategory])
const writeCategory = protect([Permission.WriteCategory])

router.param('categoryId', (req, res, next, categoryId) => {
	CategoryModel.findById(categoryId).then(category => {
		if (!category) {
			return next(notFound('Cannot find category with that id'))
		}

		req.category = category

		return next()
	})
})

router.param('id', (req, res, next, id) => {
	TeamModel.findById(id).then(team => {
		if (!team) {
			return next(notFound('Cannot find team with that id'))
		}

		req.team = team

		return next()
	})
})

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
	.delete(writeCategory, teamController.deleteCategory)

export default router
