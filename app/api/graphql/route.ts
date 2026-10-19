// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql/error';
import type { NextRequest } from 'next/server';
import {
  createAnimalInsecure,
  deleteAnimalInsecure,
  getAnimalInsecure,
  getAnimalsInsecure,
  updateAnimalInsecure,
} from '@/database/animals';
import type { Resolvers } from '@/graphql/graphqlGeneratedTypes';
import { postgresToGraphql } from '@/graphql/transform';

// your data
const typeDefs = `#graphql
  type Animal {
    id: ID!
    firstName: String!
    type: String!
    accessory: String
    birthDate: String!
  }

  type Query {
    animals: [Animal!]!
    animal(id: ID!): Animal
  }

  type Mutation {
    createAnimal(firstName: String!, type: String!, accessory: String, birthDate: String!): Animal,
    updateAnimal(id: ID!, firstName: String!, type: String!, accessory: String, birthDate: String!): Animal,
    deleteAnimal(id: ID!): Animal
  }
`;

const resolvers: Resolvers = {
  Query: {
    animals: async () => {
      const animals = await getAnimalsInsecure();
      return animals.map((animal) => postgresToGraphql(animal));
    },
    animal: async (parent, args) => {
      const animal = await getAnimalInsecure(Number(args.id));
      return postgresToGraphql(animal);
    },
  },
  Mutation: {
    createAnimal: async (parent, args) => {
      // FIXME: Use Zod or other data validation library
      if (
        typeof args.firstName !== 'string' ||
        typeof args.type !== 'string' ||
        (args.accessory && typeof args.accessory !== 'string') ||
        !args.firstName ||
        !args.type
      ) {
        throw new GraphQLError('Required field missing');
      }

      const animal = await createAnimalInsecure({
        firstName: args.firstName,
        type: args.type,
        accessory: args.accessory || null,
        birthDate: new Date(args.birthDate),
      });
      return postgresToGraphql(animal);
    },
    updateAnimal: async (parent, args) => {
      // FIXME: Use Zod or other data validation library
      if (
        typeof args.id !== 'string' ||
        typeof args.firstName !== 'string' ||
        typeof args.type !== 'string' ||
        (args.accessory && typeof args.accessory !== 'string') ||
        !args.firstName ||
        !args.type
      ) {
        throw new GraphQLError('Required field missing');
      }

      const animal = await getAnimalInsecure(Number(args.id));
      if (!animal) {
        throw new GraphQLError('Animal not found');
      }

      const updatedAnimal = await updateAnimalInsecure({
        id: Number(args.id),
        firstName: args.firstName,
        type: args.type,
        accessory: args.accessory || null,
        birthDate: new Date(args.birthDate),
      });

      return postgresToGraphql(updatedAnimal);
    },
    deleteAnimal: async (parent, args) => {
      if (typeof args.id !== 'string') {
        throw new GraphQLError('Required field missing');
      }

      const animal = await getAnimalInsecure(Number(args.id));
      if (!animal) {
        throw new GraphQLError('Animal not found');
      }

      const deletedAnimal = await deleteAnimalInsecure({
        id: Number(args.id),
      });

      return postgresToGraphql(deletedAnimal);
    },
  },
};

export const schema = typeDefs;
export type Context = Record<string, unknown>;

const apolloServer = new ApolloServer({ typeDefs, resolvers });

const apolloServerRouteHandler = startServerAndCreateNextHandler(apolloServer);

async function routeHandler(request: NextRequest): Promise<Response> {
  return await apolloServerRouteHandler(request);
}

export { routeHandler as GET, routeHandler as POST };
