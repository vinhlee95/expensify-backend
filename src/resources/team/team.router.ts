import {Router} from 'express'
import {Permission, protect} from '../../middlewares/permission'

import {
	validateGetCategories,
	validateCreateCategory,
	validateCreateExpenseItem,
} from './team.validator'
import * as teamController from './team.controller'

const router = Router()

const readCategory = protect([Permission.ReadCategory])
const writeCategory = protect([Permission.WriteCategory])
const readExpenseItem = protect([Permission.ReadExpenseItem])
const writeExpenseItem = protect([Permission.WriteExpenseItem])

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

router
	.route('/:id/expenseItems')
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/expenseItems:
	 *   get:
	 *     tags:
	 *       - Team
	 *     summary: Get all expense items for a team
	 *     parameters:
	 *     - $ref: '#/components/parameters/type'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/CategoriesResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.get(readExpenseItem, teamController.getExpenseItems)
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/expenseItems:
	 *   post:
	 *     tags:
	 *       - Team
	 *     summary: Create a new expense item
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/CategoryCreate'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/CategoryResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.post(
		writeExpenseItem,
		validateCreateExpenseItem(),
		teamController.createExpenseItem,
	)

export default router
