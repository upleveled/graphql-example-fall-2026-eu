// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against

import { randomBytes } from 'node:crypto';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import bcrypt from 'bcrypt';
import type postgres from 'postgres';
import { GraphQLError } from 'graphql/error';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import {
  createAnimal,
  deleteAnimal,
  getAnimalInsecure,
  getAnimalsInsecure,
  updateAnimal,
} from '@/database/animals.ts';
import { createNote } from '@/database/notes.ts';
import { createSessionInsecure, getValidSession } from '@/database/sessions.ts';
import {
  createUserInsecure,
  getUserInsecure,
  getUserWithPasswordHashInsecure,
} from '@/database/users.ts';
import type { Resolvers } from '@/graphql/graphqlGeneratedTypes.ts';
import { postgresToGraphql } from '@/graphql/transform.ts';
import { animalSchema } from '@/migrations/00000-createTableAnimals.ts';
import {
  userSchemaLogin,
  userSchemaRegister,
} from '@/migrations/00002-createTableUsers.ts';
import { noteSchema } from '@/migrations/00004-createTableNotes.ts';
import { secureCookieOptions } from '@/util/cookies.ts';
import { getCombinedErrorMessage } from '@/util/validation.ts';

// your data
const typeDefs = `#graphql
  type Animal {
    id: ID!
    firstName: String!
    type: String!
    accessory: String
    birthDate: String!
  }

  type User {
    id: ID!
    username: String!
  }

  type Note {
    id: ID!
    title: String!
    textContent: String!
  }

  type Query {
    animals: [Animal!]!
    animal(id: ID!): Animal
  }

  type Mutation {
    createAnimal(firstName: String!, type: String!, accessory: String, birthDate: String!): Animal,
    updateAnimal(id: ID!, firstName: String!, type: String!, accessory: String, birthDate: String!): Animal,
    deleteAnimal(id: ID!): Animal
    register(username: String!, password: String!): User
    login(username: String!, password: String!): User
    createNote(title: String!, textContent: String!): Note
  }
`;

async function getSessionTokenOrThrow(context: Context) {
  if (!context.sessionToken || !(await getValidSession(context.sessionToken))) {
    throw new GraphQLError('Unauthorized operation');
  }

  return context.sessionToken;
}

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
    createAnimal: async (parent, args, context) => {
      const sessionToken = await getSessionTokenOrThrow(context);
      const result = animalSchema.safeParse({
        animal: {
          firstName: args.firstName,
          type: args.type,
          accessory: args.accessory || null,
          birthDate: args.birthDate,
        },
      });

      if (!result.success) {
        throw new GraphQLError(getCombinedErrorMessage(result.error.issues));
      }

      const animal = await createAnimal(sessionToken, result.data.animal);

      if (!animal) {
        throw new GraphQLError('Unauthorized operation');
      }

      return postgresToGraphql(animal);
    },
    updateAnimal: async (parent, args, context) => {
      const sessionToken = await getSessionTokenOrThrow(context);
      const result = animalSchema.safeParse({
        animal: {
          firstName: args.firstName,
          type: args.type,
          accessory: args.accessory || null,
          birthDate: args.birthDate,
        },
      });

      if (!result.success) {
        throw new GraphQLError(getCombinedErrorMessage(result.error.issues));
      }

      const animal = await getAnimalInsecure(Number(args.id));
      if (!animal) {
        throw new GraphQLError('Animal not found');
      }

      const updatedAnimal = await updateAnimal(sessionToken, {
        id: Number(args.id),
        ...result.data.animal,
      });

      if (!updatedAnimal) {
        throw new GraphQLError('Unauthorized operation');
      }

      return postgresToGraphql(updatedAnimal);
    },
    deleteAnimal: async (parent, args, context) => {
      const sessionToken = await getSessionTokenOrThrow(context);
      if (typeof args.id !== 'string') {
        throw new GraphQLError('Required field missing');
      }

      const animal = await getAnimalInsecure(Number(args.id));
      if (!animal) {
        throw new GraphQLError('Animal not found');
      }

      const deletedAnimal = await deleteAnimal(sessionToken, {
        id: Number(args.id),
      });

      if (!deletedAnimal) {
        throw new GraphQLError('Unauthorized operation');
      }

      return postgresToGraphql(deletedAnimal);
    },
    register: async (parent, args) => {
      const result = userSchemaRegister.safeParse({
        user: {
          username: args.username,
          password: args.password,
        },
      });

      if (!result.success) {
        throw new GraphQLError(getCombinedErrorMessage(result.error.issues));
      }

      if (await getUserInsecure(result.data.user.username)) {
        throw new GraphQLError('Username already taken');
      }

      const passwordHash = await bcrypt.hash(result.data.user.password, 12);
      const user = await createUserInsecure(
        result.data.user.username,
        passwordHash,
      );

      if (!user) {
        throw new GraphQLError('Username already taken');
      }

      const session = await createSessionInsecure(
        randomBytes(100).toString('base64'),
        user.id,
      );

      if (!session) {
        throw new GraphQLError('Session creation failed');
      }

      (await cookies()).set({
        name: 'sessionToken',
        value: session.token,
        ...secureCookieOptions,
      });

      return {
        id: String(user.id),
        username: user.username,
      };
    },
    login: async (parent, args) => {
      const result = userSchemaLogin.safeParse({
        user: {
          username: args.username,
          password: args.password,
        },
      });

      if (!result.success) {
        throw new GraphQLError(getCombinedErrorMessage(result.error.issues));
      }

      const userWithPasswordHash = await getUserWithPasswordHashInsecure(
        result.data.user.username,
      );

      if (!userWithPasswordHash) {
        throw new GraphQLError('Username or password invalid');
      }

      const passwordIsValid = await bcrypt.compare(
        result.data.user.password,
        userWithPasswordHash.passwordHash,
      );

      userWithPasswordHash.passwordHash = '';

      if (!passwordIsValid) {
        throw new GraphQLError('Username or password invalid');
      }

      const session = await createSessionInsecure(
        randomBytes(100).toString('base64'),
        userWithPasswordHash.id,
      );

      if (!session) {
        throw new GraphQLError('Session creation failed');
      }

      (await cookies()).set({
        name: 'sessionToken',
        value: session.token,
        ...secureCookieOptions,
      });

      return {
        id: String(userWithPasswordHash.id),
        username: userWithPasswordHash.username,
      };
    },
    createNote: async (parent, args, context) => {
      const sessionToken = await getSessionTokenOrThrow(context);
      const result = noteSchema.safeParse({
        note: {
          title: args.title,
          textContent: args.textContent,
        },
      });

      if (!result.success) {
        throw new GraphQLError(getCombinedErrorMessage(result.error.issues));
      }

      try {
        const note = await createNote(
          sessionToken,
          result.data.note.title,
          result.data.note.textContent,
        );

        if (!note) {
          throw new GraphQLError('Unauthorized operation');
        }

        return postgresToGraphql(note);
      } catch (error) {
        const databaseError = error as postgres.PostgresError;
        if (
          databaseError.code === '23505' &&
          databaseError.constraint_name === 'notes_title_key'
        ) {
          throw new GraphQLError('Note title already exists');
        }
        throw error;
      }
    },
  },
};

export const schema = typeDefs;
export type Context = {
  sessionToken?: string;
};

const apolloServer = new ApolloServer<Context>({ typeDefs, resolvers });

const apolloServerRouteHandler = startServerAndCreateNextHandler<NextRequest>(
  apolloServer,
  {
    context: (request) => {
      return Promise.resolve({
        sessionToken: request.cookies.get('sessionToken')?.value,
      });
    },
  },
);

async function routeHandler(request: NextRequest): Promise<Response> {
  return await apolloServerRouteHandler(request);
}

export { routeHandler as GET, routeHandler as POST };
