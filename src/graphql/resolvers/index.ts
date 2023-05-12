/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";

const resolvers = fs
  .readdirSync(path.join(__dirname, "./"))
  .filter(
    (file) =>
      !file.includes("index") && (file.endsWith(".ts") || file.endsWith(".js"))
  )
  .map((file) => require(`./${file}`).default);

const Query = Object.assign({}, ...resolvers.map((resolver) => resolver.Query));
const Mutation = Object.assign(
  {},
  ...resolvers.map((resolver) => resolver.Mutation)
);

export default {
  Query,
  Mutation,
};
