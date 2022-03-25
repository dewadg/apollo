import tap from 'tap'
import fetch from 'cross-fetch'
import gql from 'graphql-tag'
import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink } from '@apollo/client/core'
import { provideApolloClient, useLazyQuery } from '../../src'

const httpLink = createHttpLink({
  uri: process.env.GQL_HOST,
  fetch
})

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      authorization: `Bearer ${process.env.GQL_ACCESS_TOKEN}`
    }
  })

  return forward(operation)
})

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
})

provideApolloClient(apolloClient)

const {
  result,
  load
} = useLazyQuery(gql`
  query($keyword: String!) {
    searchMyExplorables(keyword: $keyword) {
      __typename
      ... on Category {
        id
        name
        parent {
          id
          name
        }
      }
      ... on File {
        id
        name: fileName
        url
        category {
          id
          name
        }
      }
    }
  }
`, () => ({
  keyword: 'Geo'
}), {
  fetchPolicy: 'network-only'
})

load()

setTimeout(() => {
  console.log('result', result.value)
  tap.pass('test')
}, 2000)
