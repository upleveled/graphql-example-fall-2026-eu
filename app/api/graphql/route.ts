// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { GraphQLError } from 'graphql/error';
import gql from 'graphql-tag';
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
const typeDefs = gql`
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
      const animalId = Number(args.id);

      if (isNaN(animalId)) {
        throw new GraphQLError('Invalid animal id');
      }

      const animal = await getAnimalInsecure(animalId);
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
      const animalId = Number(args.id);

      if (isNaN(animalId)) {
        throw new GraphQLError('Invalid animal id');
      }

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

      const animal = await getAnimalInsecure(animalId);
      if (!animal) {
        throw new GraphQLError('Animal not found');
      }

      const updatedAnimal = await updateAnimalInsecure({
        id: animalId,
        firstName: args.firstName,
        type: args.type,
        accessory: args.accessory || null,
        birthDate: new Date(args.birthDate),
      });

      return postgresToGraphql(updatedAnimal);
    },
    deleteAnimal: async (parent, args) => {
      const animalId = Number(args.id);

      if (isNaN(animalId)) {
        throw new GraphQLError('Invalid animal id');
      }

      const animal = await getAnimalInsecure(animalId);
      if (!animal) {
        throw new GraphQLError('Animal not found');
      }

      const deletedAnimal = await deleteAnimalInsecure({
        id: animalId,
      });

      return postgresToGraphql(deletedAnimal);
    },
  },
};

export type Context = Record<string, unknown>;

const apolloServer = new ApolloServer({ typeDefs, resolvers });

const apolloServerRouteHandler = startServerAndCreateNextHandler(apolloServer);

async function routeHandler(request: NextRequest): Promise<Response> {
  return await apolloServerRouteHandler(request);
}

export { routeHandler as GET, routeHandler as POST };
