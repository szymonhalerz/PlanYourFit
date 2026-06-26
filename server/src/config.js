require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

module.exports = {
	port: Number(process.env.PORT || 4000),
	nodeEnv: process.env.NODE_ENV || 'development',
	clientUrl: process.env.CLIENT_URL || 'http://localhost:4000',
	demoMode: process.env.DEMO_MODE !== 'false',
	db: {
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT || 3306),
		database: process.env.DB_NAME || 'planyourfit',
		user: process.env.DB_USER || 'root',
		password: process.env.DB_PASSWORD || '',
	},
	overpassUrl: process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
	osrmFootUrl: process.env.OSRM_FOOT_URL || 'https://routing.openstreetmap.de/routed-foot',
	nominatimUserAgent: process.env.NOMINATIM_USER_AGENT || 'PlanYourFit/1.0 (contact: admin@planyourfit.local)',
}
