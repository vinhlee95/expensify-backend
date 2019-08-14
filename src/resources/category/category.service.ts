import CategoryModel, {CategoryDocument} from './category.model'

/**
 * Get all categories
 *
 * @param type
 * @param teamId
 */
export const getMany = async (
	type: string,
	teamId: string,
): Promise<CategoryDocument> => {
	const categories = await CategoryModel.find({
		type,
		team: teamId,
	})
		.lean()
		.exec()

	return categories
}
