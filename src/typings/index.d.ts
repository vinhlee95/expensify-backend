import {UserDocument} from '../../resources/user/user.model'
import {CategoryDocument} from '../resources/category/category.model'
import {TeamDocument} from '../resources/team/team.model'
import {ItemDocument} from '../resources/item/item.model'

declare global {
	namespace jest {
		interface Matchers<R> {
			toEqualUser(user: UserDocument): R
		}
	}
}

declare global {
	namespace Express {
		interface Request {
			category?: CategoryDocument
			team?: TeamDocument
			item?: ItemDocument
		}
	}
}
