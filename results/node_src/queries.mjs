import camelCase from 'lodash/camelCase.js'
import { indentString } from './indent_string.mjs'
import { getQuestionId } from './helpers.mjs'

export const getLocalesQuery = (localeIds, contexts, loadStrings = true) => {
    const args = []
    if (localeIds.length > 0) {
        args.push(`localeIds: [${localeIds.map(id => `"${id}"`).join(',')}]`)
    }
    if (contexts.length > 0) {
        args.push(`contexts: [${contexts.join(', ')}]`)
    }

    const argumentsString = args.length > 0 ? `(${args.join(', ')})` : ''

    return `
query {
    internalAPI {
        locales${argumentsString} {
            completion
            id
            label
            ${
                loadStrings
                    ? `strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }`
                    : ''
            }
            translators
        }
    }
}
`
}

const getEntityFragment = () => `entity {
    name
    nameHtml
    nameClean
    id
    homepage {
      url
    }
    youtube {
      url
    }
    twitter {
      url
    }
    twitch {
      url
    }
    rss {
      url
    }
    blog { 
        url
    }
    mastodon {
        url
    }
    github {
        url
    }
    npm {
        url
    }
}`

const getFacetFragment = addEntities => `
    facetBuckets {
        id
        count
        percentageQuestion
        percentageSurvey
        percentageFacet
        ${addEntities ? getEntityFragment() : ''}
    }
`

export const getMetadataQuery = ({ surveyId, editionId }) => {
    return `
query {
    dataAPI {
        surveys {
            ${surveyId} {
                _metadata {
                    domain
                    id
                    name
                    partners {
                        name
                        url
                        imageUrl
                    }
                }
                ${editionId} {
                    _metadata {
                        id
                        year
                        status
                        startedAt
                        endedAt
                        questionsUrl
                        resultsUrl
                        imageUrl
                        faviconUrl
                        socialImageUrl
                        sponsors {
                            id
                            name
                            url
                            imageUrl
                        }
                        credits {
                            id
                            role
                        }
                        sections {
                            id
                            questions {
                                id
                                template
                                entity {
                                    id
                                    name
                                    nameClean
                                    nameHtml
                                }
                                options {
                                    ${getEntityFragment()}
                                    id
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}`
}

const allEditionsFragment = `editionId
  year`

// v1: {"foo": "bar"} => {foo: "bar"}
// const unquote = s => s.replace(/"([^"]+)":/g, '$1:')

// v2: {"foo": "bar"} => {foo: bar} (for enums)
const unquote = s => s.replaceAll('"', '')

const wrapArguments = args => {
    const keys = Object.keys(args)

    return keys.length > 0
        ? `(${keys
              .filter(k => !!args[k])
              .map(k => `${k}: ${args[k]}`)
              .join(', ')})`
        : ''
}

const getQuestionIdString = (questionId, fieldId) =>
    questionId === fieldId ? questionId : `${questionId}: ${fieldId}`

export const getDefaultQuery = ({
    surveyId,
    editionId,
    sectionId,
    questionId,
    fieldId,
    facet,
    filters,
    parameters = {},
    addEntities = false,
    allEditions = false
}) => {
    const args = {}
    if (facet) {
        args.facet = facet
    }
    if (filters) {
        args.filters = unquote(JSON.stringify(filters))
    }
    if (parameters) {
        args.parameters = unquote(JSON.stringify(parameters))
    }
    const editionType = allEditions ? 'allEditions' : 'currentEdition'

    return `
dataAPI {
  surveys {
    ${surveyId} {
      ${editionId} {
        ${sectionId} {
          ${getQuestionIdString(questionId, fieldId)} {
            responses${wrapArguments(args)} {
              ${editionType} {
                ${allEditions ? allEditionsFragment : ''}
                completion {
                  count
                  percentageSurvey
                  total
                }
                buckets {
                  count
                  id
                  percentageQuestion
                  percentageSurvey
                  ${addEntities ? getEntityFragment() : ''}
                  ${facet ? getFacetFragment(addEntities) : ''}
                }
              }
            }
          }
        }
      }
    }
  }
}
`
}

export const getQueryName = ({ editionId, questionId }) =>
    `${camelCase(editionId)}${camelCase(questionId)}Query`

/*

Wrap query contents with query FooQuery {...}

*/
export const wrapQuery = ({ queryName, queryContents }) => `query ${queryName} {
   ${indentString(queryContents, 4)}
}`

/*

Remove "dataAPI" part

*/
const removeLast = (str, char) => {
    const lastIndex = str.lastIndexOf(char)
    return str.substring(0, lastIndex) + str.substring(lastIndex + 1)
}

export const cleanQuery = query => {
    const cleanQuery = removeLast(query.replace('dataAPI {', ''), '}')
    return cleanQuery
}

const enableCachePlaceholder = 'ENABLE_CACHE_PLACEHOLDER'

/*

Get query by either

A) generating a default query based on presets

or 

B) using query defined in block template definition

*/
const defaultQueries = [
    'currentEditionData',
    'currentEditionDataWithEntities',
    'allEditionsData',
    'allEditionsDataWithEntities'
]
export const getQuery = ({ query, queryOptions, isLog = false }) => {
    const { editionId, questionId } = queryOptions
    const queryName = getQueryName({ editionId, questionId })

    const enableCache = process.env.USE_CACHE === 'false' ? false : true
    let queryContents
    if (defaultQueries.includes(query)) {
        if (['allEditionsData'].includes(query)) {
            queryOptions.allEditions = true
        }
        if (['currentEditionDataWithEntities', 'allEditionsDataWithEntities'].includes(query)) {
            queryOptions.addEntities = true
        }
        if (!isLog) {
            queryOptions.parameters.enableCache = enableCache
        }
        queryContents = getDefaultQuery(queryOptions)
    } else {
        queryContents = query
        if (isLog) {
            queryContents = queryContents.replace(enableCachePlaceholder, '')
        } else {
            queryContents = queryContents.replace(
                enableCachePlaceholder,
                `enableCache: ${enableCache.toString()}`
            )
        }
    }

    const wrappedQuery = wrapQuery({ queryName, queryContents })
    return wrappedQuery
}
