const entityFragment = `
id
nameClean
nameHtml
example {
  language
  code
  codeHighlighted
}
descriptionClean
descriptionHtml
homepage {
  url
}
github {
  url
}
mdn {
  url
  summary
}
w3c {
  url
}
caniuse {
  name
  url
}
resources {
  title
  url
}
tags
patterns
`

export const getEntitiesQuery = () => `
query EntitiesQuery {
  entities(includeNormalizationEntities: true, includeAPIOnlyEntities: false) {
    ${entityFragment}
  }
}
`
