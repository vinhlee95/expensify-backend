import {Router} from 'express'
import {protect, Permission} from '../../middlewares/permission'
import {validateGetCategories} from './category.validator'
import * as categoryController from './category.controller'

const router = Router()
const readCategory = protect([Permission.ReadCategory])

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

export default router
