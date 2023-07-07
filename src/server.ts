import { env } from './env'
import { app } from './app'

const port = env.APP_PORT

app.listen({ port }).then(() => console.log('Running on port: ' + port))
