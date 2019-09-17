import mongoose from 'mongoose'

export interface Team {
	name: string
	description?: string
	creator: mongoose.Types.ObjectId
	slug: string
}

export interface TeamInput {
	name: string
	description?: string
	creator: string
}
