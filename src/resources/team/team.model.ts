import mongoose, {Document, Schema} from 'mongoose'
import {Team} from './team.interface'
import {slugify} from '../../utils/util'

export interface TeamDocument extends Document, Team {
	findBySlug: () => any
}

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
		slug: {
			type: String,
		},
	},
	{timestamps: true},
)

teamSchema.pre<TeamDocument>('save', function(next) {
	if (this.isModified('name')) {
		this.slug = slugify(this.name)
	}

	return next()
})

teamSchema.methods.findBySlug = function(slug: string) {
	return this.find({slug})
}

const TeamModel = mongoose.model<TeamDocument>('team', teamSchema)

export default TeamModel
