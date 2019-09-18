import _ from 'lodash'
import {NextFunction, Request, RequestHandler, Response} from 'express'
import {checkToken} from './auth'
import {UserRole, UserStatus} from '../resources/user/user.interface'
import apiError, {ErrorCode} from '../utils/apiError'

/**
 * Declare user's permissions
 */
export enum Permission {
	ReadUser = 'user:read',
	WriteUser = 'user:write',
	WriteTeam = 'team:write',
	ReadTeam = 'team:read',
	ReadCategory = 'category:read',
	WriteCategory = 'category:write',
	ReadItem = 'item:read',
	WriteItem = 'item:write',
}

type PermissionRole = {[key in UserRole]: Permission[]}

const commonPermissions = [
	Permission.ReadUser,
	Permission.WriteTeam,
	Permission.ReadTeam,
	Permission.ReadCategory,
	Permission.WriteCategory,
	Permission.ReadItem,
	Permission.WriteItem,
]

export const permissionRole: PermissionRole = {
	[UserRole.Admin]: [...commonPermissions, Permission.WriteUser],
	[UserRole.User]: commonPermissions,
}

/**
 * Middleware to check user's permissions
 *
 * @param permissions
 */
const checkPermission = (permissions?: [Permission]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const {user} = req

		if (!user) {
			return next(apiError.unauthorized())
		}

		const userPermissions = permissionRole[user.role as UserRole]
		const hasPermission =
			_.difference(permissions, userPermissions).length === 0

		if (hasPermission) {
			return next()
		} else {
			return next(
				apiError.forbidden(
					'User has no permission to perform this action',
					ErrorCode.notHasPermission,
				),
			)
		}
	}
}

/**
 * Middleware to check user's status
 *
 * @param permissions
 */
export const checkUserStatus: RequestHandler = (req, res, next) => {
	const {user} = req

	if (!user) {
		return next(apiError.unauthorized())
	}

	if (user.status === UserStatus.Active) {
		return next()
	} else {
		return next(
			apiError.forbidden(
				'User has not been activated',
				ErrorCode.notActiveUser,
			),
		)
	}
}

/**
 * Middleware to check user's token then permissions
 *
 * @param permissions
 */
export const protect = (permissions: [Permission]) => {
	return [checkToken(), checkUserStatus, checkPermission(permissions)]
}
