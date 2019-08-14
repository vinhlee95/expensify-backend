import {Router} from 'express'
import {protect, Permission} from '../../middlewares/permission'
import {validateGetCategories} from './category.validator'
import * as categoryController from './category.controller'

const router = Router()
const readCategory = protect([Permission.ReadCategory])

// Get /categories
router
	.route('/')
	.get(readCategory, validateGetCategories(), categoryController.getMany)

export default router
