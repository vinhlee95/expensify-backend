import {RequestHandler, Router} from 'express'
import {Permission, protect} from '../../middlewares/permission'

import {
	validateGetCategories,
	validateCreateCategory,
	validateCreateItem,
	validateUpdateCategory,
	checkTeamCreator,
	validateUpdateItem,
	checkBelongToTeam,
	validateGetTotalByCategory,
} from './team.validator'
import * as teamController from './team.controller'
const router = Router()

const readCategory = [...protect([Permission.ReadCategory]), checkBelongToTeam]
const writeCategory = [
	...protect([Permission.WriteCategory]),
	checkBelongToTeam,
]
const readItem = [...protect([Permission.ReadItem]), checkBelongToTeam]
const writeItem = [...protect([Permission.WriteItem]), checkBelongToTeam]

router.param('categoryId', teamController.parseCategoryIdParam)
router.param('itemId', teamController.parseItemIdParam)
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
 * /api/teams/{id}/items:
 *   parameters:
 *     - $ref: '#/components/parameters/id'
 */
router
	.route('/:id/items')
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/items:
	 *   get:
	 *     tags:
	 *       - Team
	 *     summary: Get all items for a team
	 *     parameters:
	 *     - $ref: '#/components/parameters/type'
	 *     - $ref: '#/components/parameters/field'
	 *     - $ref: '#/components/parameters/sort'
	 *     - $ref: '#/components/parameters/offset'
	 *     - $ref: '#/components/parameters/limit'
	 *     - $ref: '#/components/parameters/search'
	 *     - $ref: '#/components/parameters/from'
	 *     - $ref: '#/components/parameters/to'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/ItemsResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.get(readItem, teamController.getItems)
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/items:
	 *   post:
	 *     tags:
	 *       - Team
	 *     summary: Create a new item
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/ItemCreate'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/ItemResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.post(writeItem, validateCreateItem(), teamController.createItem)

/**
 * @swagger
 *
 * /api/teams/{id}/items/{itemId}:
 *   parameters:
 *     - $ref: '#/components/parameters/id'
 *     - $ref: '#/components/parameters/itemId'
 */
router
	.route('/:id/items/:itemId')
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/items/{itemId}:
	 *   delete:
	 *     tags:
	 *       - Team
	 *     summary: Delete a item
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/ItemResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.delete(writeItem, teamController.deleteItem)
	/**
	 * @swagger
	 *
	 * /api/teams/{id}/items/{itemId}:
	 *   put:
	 *     tags:
	 *       - Team
	 *     summary: Update a item
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/ItemUpdate'
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/ItemResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.put(writeItem, validateUpdateItem(), teamController.updateItem)

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

/**
 * @swagger
 *
 * /api/teams/{id}/total:
 *   parameters:
 *     - $ref: '#/components/parameters/id'
 */
router
	.route('/:id/total/category')
	.get(
		readItem,
		validateGetTotalByCategory(),
		teamController.getTotalByCategory,
	)

export default router
