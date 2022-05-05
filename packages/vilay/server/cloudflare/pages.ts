import { buildHandler } from './common'

export default buildHandler((request, env) => env.ASSETS.fetch(request))
