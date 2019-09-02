const express = require('express');
const graphqlHTTP = require('express-graphql');
const { GraphQLScalarType, buildSchema } = require('graphql');

const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} = require('graphql-iso-date');

const typeDefs = buildSchema(`
  scalar Map
  scalar JSON
  scalar Object
  scalar Date
  scalar DateTime
  scalar Long

  input Complex {
    real: Long
    imaginary: Long
  }

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: Map
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    things(obj: Object!, json: JSON!, map: Map!): Object
    long(limit: Int! = 10): Int
    now: DateTime
    complex(c: Complex!): Long
  }
`);

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

function checkLong(value) {
  console.log('checking long', value);
  throw new Error('parsing or serializing long ' + value);

  if (typeof value !== 'number')
    throw new TypeError(`${value} is not a number`)

  if (!Number.isInteger(value))
    throw new TypeError(`${value} is not a long`)

  return value
}

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  // Query: {
    things: (args) => args,
    now: () => new Date(),
    long: () => 123,
    complex: (args) => args.c.real
  // }
};
  // },
const garbo = {
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
  }),
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime,
  Long: new GraphQLScalarType({
    name: 'Long',
    serialize: checkLong,
    parseValue: checkLong,
    parseLiteral(ast) {
      console.log('parseLiteral', ast);
      throw new Error('parsing not implemented');
    }
  })
};

const app = express();
app.use(require('morgan')('dev'));
app.use('/graphql', graphqlHTTP({
  schema: typeDefs,
  rootValue: resolvers,
  graphiql: true,
}));

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
app.listen(3000, () => {
  console.log(`🚀  Server ready at http://localhost:3000/graphql`);
});