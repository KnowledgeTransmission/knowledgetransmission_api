import Log from "./utils/Log";
import { APP } from "./config/default";
import { dbConnect } from "./config/dbConnect";

import dotenv from "dotenv-flow";
import { ApolloServer } from "apollo-server-fastify";
import fastify, { FastifyInstance } from "fastify";

import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import cookie from "@fastify/cookie";

import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";

const main = async () => {
  dotenv.config({
    default_node_env: "development",
    silent: true,
  });
  Log.info(`current env ${process.env.NODE_ENV}`);
  dotenv
    .listDotenvFiles(".", process.env.NODE_ENV)
    .forEach((file) => Log.info(`loaded env from ${file}`));

  const port = APP.port as number;
  const host = APP.host as string;
  host;

  const BASIC_LOGGING = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(requestContext) {
      Log.info("request started:", requestContext.request.query);

      return {
        // Fires whenever Apollo Server will parse a GraphQL
        // request to create its associated document AST.
        async parsingDidStart() {
          Log.info("parsing started");
        },

        // Fires whenever Apollo Server will validate a
        // request's document AST against your GraphQL schema.
        async validationDidStart() {
          Log.info("validation started");
        },

        async didEncounterErrors(requestContext) {
          Log.error(requestContext.errors);
        },
      };
    },
  };

  const fastifyAppClosePlugin = (app: FastifyInstance) => {
    return {
      async serverWillStart() {
        return {
          async drainServer() {
            await app.close();
          },
        };
      },
    };
  };

  const app = fastify({ trustProxy: true });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ request }) => ({ request }),
    plugins: [
      BASIC_LOGGING,
      fastifyAppClosePlugin(app),
      ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
    ],
  });

  try {
    const db = dbConnect;
    db.connect();
    Log.event("db connected");
    await server.start();
    Log.event("apollo server started");

    app.register(cookie);
    app.register(server.createHandler());

    const address = await app.listen(
      port || 8000,
      process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost"
    );
    Log.ready(
      `started server on ${address}, graphpql: ${address + server.graphqlPath}`
    );
  } catch (error) {
    Log.error(error);
  }
};

main();
