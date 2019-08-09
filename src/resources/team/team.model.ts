import mongoose, {Document} from 'mongoose'

import {Team} from './team.interface'

export interface TeamDocument extends Document, Team {

}

const teamSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
}, {timestamps: true})

const TeamModel = mongoose.model<TeamDocument>('team', teamSchema)

export default TeamModel