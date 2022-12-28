import { initEntities, cacheSurveysEntities } from './entities'
import { initSurveys } from './surveys'
import { initProjects } from './projects'
import { RequestContext, WatchedItem } from './types'

type InitFunctionsType = {
    [k in WatchedItem]?: any
}

const initFunctions: InitFunctionsType = {
    entities: initEntities,
    surveys: initSurveys
}

export const initMemoryCache = async ({
    context,
    initList = ['entities', 'surveys']
}: {
    context: RequestContext
    initList?: WatchedItem[]
}) => {
    console.log(`// Initializing in-memory cache for ${initList.join(', ')}…`)
    const data: any = {}
    for (const initFunctionName of initList) {
        const f = initFunctions[initFunctionName]
        const result = await f({ context })
        data[initFunctionName] = result
    }
    return data
}

export const initDbCache = async ({ context, data }: { context: RequestContext; data: any }) => {
    console.log('// Initializing db cache…')
    const { surveys, entities } = data
    await cacheSurveysEntities({
        surveys,
        entities,
        context
    })

    await initProjects({ context })
}
