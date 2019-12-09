const mongoPort = process.env.MONGO_PORT || 27017

const config = {
	seed: true,
	loggerLevel: 'debug',
	secrets: {
		jwt: 'jwtdev',
	},
	mailSender: 'dev<noreply@dev.com>',
	dbUrl: `mongodb://mongo:${mongoPort}/expensify-dev`,
}

export default config
