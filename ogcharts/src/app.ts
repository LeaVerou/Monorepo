import express, { json } from "express"
import { getConfig } from "./config"
import { flyGenerator, FLY_PREFIX } from "./fly-generator"
import { localGenerator } from "./local-generator"
import { s3Generator } from "./s3-generator"

const app = express()
const { port, appUrl } = getConfig()

app.use(json())

app.use("/local", localGenerator)
app.use(FLY_PREFIX, flyGenerator)
app.use("/cloud", s3Generator)


// Keep after routers otherwise it acts as a catch-all
app.use("/", (req, res) => {
    res.send(`
    <h2>Image:</h2>
    <img src="/fly/serve?survey=stateofjs&edition=js2022&section=environment&question=browser"  />
    <h2>Meta:</h2>
    <a href="/fly/og?survey=stateofjs&edition=js2022&section=environment&question=browser">Access meta page</a>
    `)
})

app.listen(port, () => {
    console.log(`Open Graph chart app listening on ${appUrl}`)
})