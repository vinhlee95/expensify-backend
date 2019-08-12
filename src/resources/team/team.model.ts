import mongoose, {Document, Schema} from 'mongoose'

import {Team} from './team.interface'

export interface TeamDocument extends Document, Team {}

const teamSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: true,
		},
	},
	{timestamps: true},
)

const TeamModel = mongoose.model<TeamDocument>('team', teamSchema)

export default TeamModel
