import type { EditionMetadata, SurveyMetadata } from '@devographics/types'
import {
    getSurveysQuery,
    getEditionQuery,
    getEditionQuerySurveyForm,
    getSurveyQuery
} from './queries'
import { logToFile } from '@devographics/helpers'

export const getApiUrl = () => {
    const apiUrl = process.env.DATA_API_URL
    if (!apiUrl) {
        throw new Error('process.env.DATA_API_URL not defined, it should point the the API')
    }
    return apiUrl
}

/**
 * If connecting to the local API instance, will also include the demo survey
 * /!\ if you run the production version of the API locally, you may need to reset your Redis cache
 * to get the demo survey back
 * @param param0
 * @returns
 */
export const fetchSurveysListGraphQL = async ({
    includeQuestions
}: { includeQuestions?: boolean }): Promise<Array<SurveyMetadata>> => {
    const query = getSurveysQuery({ includeQuestions })
    await logToFile('fetchSurveysListGraphQL.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({ query })
    await logToFile('fetchSurveysListGraphQL.json', result, { mode: 'overwrite' })
    return result._metadata.surveys as SurveyMetadata[]
}

export const fetchEditionGraphQL = async ({ surveyId, editionId }: { surveyId: string, editionId: string }): Promise<EditionMetadata> => {
    const query = getEditionQuery({ surveyId, editionId })
    await logToFile('fetchEditionGraphQL.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({ query })
    await logToFile('fetchEditionGraphQL.json', result, { mode: 'overwrite' })
    return result._metadata.surveys[0].editions[0]
}

export const fetchSurveyGraphQL = async ({ surveyId }: { surveyId: string }): Promise<SurveyMetadata> => {
    const query = getSurveyQuery({ surveyId })
    await logToFile('fetchSurveyGraphQL.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({ query })
    await logToFile('fetchSurveyGraphQL.json', result, { mode: 'overwrite' })
    return result[surveyId]._metadata as SurveyMetadata
}

export const fetchEditionGraphQLSurveyForm = async ({
    surveyId,
    editionId
}: { surveyId: string, editionId: string }): Promise<EditionMetadata> => {
    const query = getEditionQuerySurveyForm({ surveyId, editionId })
    await logToFile('fetchEditionGraphQLSurveyForm.gql', query, { mode: 'overwrite' })
    const result = await fetchGraphQLApi({ query })
    await logToFile('fetchEditionGraphQLSurveyForm.json', result, { mode: 'overwrite' })
    return result._metadata.surveys[0].editions[0]
}

export const fetchGraphQLApi = async ({ query }: { query: string }): Promise<any> => {
    console.debug(`// querying ${getApiUrl()} (${query.slice(0, 15)}...)`)
    const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ query, variables: {} }),
        // always get a fresh answer
        cache: 'no-store'
    })
    const json: any = await response.json()
    if (json.errors) {
        console.log('// surveysQuery API query error')
        console.log(JSON.stringify(json.errors, null, 2))
        throw new Error()
    }
    return json.data
}
