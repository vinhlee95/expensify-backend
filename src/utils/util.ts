import uuidv4 from 'uuid/v4'
import moment from 'moment'
import config from '../config'

const currentMonth = moment().month()
const currentYear = moment().year()

export const generateResetToken = () => {
	const resetToken = uuidv4()

	const {resetTokenExp} = config.secrets

	if (typeof resetTokenExp === 'number') {
		return {
			resetToken,
			resetTokenExp: Date.now() + resetTokenExp,
		}
	} else {
		throw Error('Invalid reset token exp')
	}
}

export const enumToValues = (enumObject: any, isNumberEnum?: boolean) => {
	return Object.keys(enumObject)
		.map(k => enumObject[k])
		.filter(val => typeof val === (!isNumberEnum ? 'string' : 'number'))
}

export const slugify = (text: string) => {
	const a =
		'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;'
	const b =
		'aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------'
	const p = new RegExp(a.split('').join('|'), 'g')

	return text
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
		.replace(/&/g, '-and-') // Replace & with 'and'
		.replace(/[^\w\-]+/g, '') // Remove all non-word characters
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, '') // Trim - from end of text
		.concat('-' + uuidv4().split('-')[0])
}

export const getMonthBounds = (
	month: number = currentMonth,
	year: number = currentYear,
) => ({
	firstDay: moment()
		.month(month)
		.year(year)
		.startOf('month')
		.toDate(),
	lastDay: moment()
		.month(month)
		.year(year)
		.endOf('month')
		.toDate(),
	today: moment().toDate(),
})
