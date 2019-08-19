import {Router} from 'express'
import * as userController from './user.controller'
import {Permission, protect} from '../../middlewares/permission'
import {
	validateGetUsers,
	validateUpdateMe,
	validateUpdateUser,
} from './user.validator'
import {validateGetTeamBySlug} from '../team/team.validator'
import {checkToken} from '../../middlewares/auth'

/**
 * @swagger
 *
 * tags:
 * - name: User
 */
const router = Router()

const writeUser = protect([Permission.WriteUser])
const readUser = protect([Permission.ReadUser])
const readTeam = protect([Permission.ReadTeam])

/**
 * @swagger
 *
 * /api/users:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users
 *     parameters:
 *       - $ref: '#/components/parameters/field'
 *       - $ref: '#/components/parameters/sort'
 *       - $ref: '#/components/parameters/offset'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/UsersResponse'
 *       default:
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.route('/').get(readUser, validateGetUsers(), userController.getMany)

router
	.route('/me')
	/**
	 * @swagger
	 *
	 * /api/users/me:
	 *   get:
	 *     tags:
	 *       - User
	 *     summary: Get my profile
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/UserResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.get(checkToken(), userController.getMe)
	/**
	 * @swagger
	 *
	 * /api/users/me:
	 *   put:
	 *     tags:
	 *       - User
	 *     summary: Update my profile
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/UserUpdateMe'
	 *     responses:
	 *       '201':
	 *         $ref: '#/components/responses/UserResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.put(readUser, validateUpdateMe(), userController.updateMe)

/**
 * @swagger
 *
 * /api/users/{id}:
 *   parameters:
 *     - $ref: '#/components/parameters/id'
 */

router
	.route('/:id')
	/**
	 * @swagger
	 *
	 * /api/users/{id}:
	 *   get:
	 *     tags:
	 *       - User
	 *     summary: Get one user
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/UserResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.get(readUser, userController.getOne)

	/**
	 * @swagger
	 *
	 * /api/users/{id}:
	 *   put:
	 *     tags:
	 *       - User
	 *     summary: Update one user
	 *     requestBody:
	 *       $ref: '#/components/requestBodies/UserUpdate'
	 *     responses:
	 *       '201':
	 *         $ref: '#/components/responses/UserResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.put(writeUser, validateUpdateUser(), userController.updateOne)

	/**
	 * @swagger
	 *
	 * /api/users/{id}:
	 *   delete:
	 *     tags:
	 *       - User
	 *     summary: Delete one user
	 *     responses:
	 *       '200':
	 *         $ref: '#/components/responses/UserResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.delete(writeUser, userController.deleteOne)

router
	.route('/me/teams')
	/**
	 * @swagger
	 *
	 * /api/users/me/teams:
	 *   get:
	 *     tags:
	 *       - User
	 *     summary: Get user's own teams
	 *     responses:
	 *       '201':
	 *         $ref: '#/components/responses/TeamsResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.get(readTeam, userController.getMyTeams)

router
	.route('/me/teams/:slug')
	/**
	 * @swagger
	 *
	 * /api/users/me/teams/{slug}:
	 *   get:
	 *     tags:
	 *       - User
	 *     summary: Get user's team by slug
	 *     parameters:
	 *       - $ref: '#/components/parameters/slug'
	 *     responses:
	 *       '201':
	 *         $ref: '#/components/responses/TeamResponse'
	 *       default:
	 *         $ref: '#/components/responses/ErrorResponse'
	 */
	.get(readTeam, validateGetTeamBySlug(), userController.getTeamBySlug)

export default router
