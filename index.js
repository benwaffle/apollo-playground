const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const typeDefs = gql`
  scalar Map
  scalar JSON
  scalar Object

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: Map
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    things(obj: Object, json: JSON, map: Map): JSON
  }
`;

const checkObject = valuesMustHaveSameType => value => {
  if (Array.isArray(value))
    throw new TypeError('keys should be strings');

  if (typeof value !== 'object')
    throw new TypeError('not an object');

  if (valuesMustHaveSameType && Object.keys(value).length > 0) {
    const types = Object.keys(value).map(key => Array.isArray(value[key]) ? 'array' : typeof value[key]);
    const allSame = types.reduce(({ fail, type }, cur) => {
      return {
        fail: fail || (cur !== type),
        type
      };
    }, { fail: false, type: types[0] });
    if (allSame.fail)
      throw new TypeError('all values of a map should have the same type');
  }

  return value;
}

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    things: (_, args) => args
  },
  Map: new GraphQLScalarType({
    name: 'Map',
    description: 'map of string to anything',
    serialize: checkObject(true),
    parseValue: checkObject(true),
    parseLiteral(ast) {
      console.log('parseLiteral', ast);
      throw new Error('parsing not implemented');
    }
  }),
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'any valid JSON type',
    serialize: x => x,
    parseValue: x => x,
    parseLiteral(ast) {
      console.log('parseLiteral', ast);
      throw new Error('parsing not implemented');
    }
  }),
  Object: new GraphQLScalarType({
    name: 'Object',
    description: 'JSON object',
    serialize: checkObject(false),
    parseValue: checkObject(false),
    parseLiteral(ast) {
      console.log('parseLiteral', ast);
      throw new Error('parsing not implemented');
    }
  })
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});