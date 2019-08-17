import {Router} from 'express'
import {protect, Permission} from '../../middlewares/permission'
import {
	validateGetCategories,
	validateCreateCategory,
} from './category.validator'
import * as categoryController from './category.controller'

const router = Router()
const readCategory = protect([Permission.ReadCategory])
const writeCategory = protect([Permission.WriteCategory])

// Get /categories
router
	.route('/')
	/**
	 * @swagger
	 *
	 * /api/categories:
	 *   get:
	 *     tags:
	 *       - Categories
	 *     summary: Get all categories for a team
	 *     parameters:
	 *       - $ref: '#/components/parameters/type'
	 *       - $ref: '#/components/parameters/teamId'
	 *         required: true
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/CategoriesResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.get(readCategory, validateGetCategories(), categoryController.getMany)
	/**
	 * @swagger
	 *
	 * /api/categories:
	 *   post:
	 *     tags:
	 *       - Categories
	 *     summary: Create a new category
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/CategoryCreate'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/CategoryResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.post(writeCategory, validateCreateCategory(), categoryController.createOne)

export default router
