export interface User {
	firstName: string
	lastName: string
	email: string
	role?: UserRole
	status?: UserStatus
	passport: Passport
	teams?: [string]
}

interface Passport {
	password?: string

	resetToken?: string
	resetTokenExp?: number

	tokenId?: string
}

export enum UserStatus {
	Initial = 'initial',
	Active = 'active',
	Disabled = 'disabled',
}

export enum UserRole {
	Admin = 'admin',
	User = 'user',
}
