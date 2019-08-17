export interface Team {
	name: string
	description?: string
	creator: string
	slug: string
}

export interface TeamInput {
	name: string
	description?: string
	creator: string
}
