/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";

const schema = fs
  .readdirSync(path.join(__dirname, "./"))
  .filter(
    (file) =>
      !file.includes("index") && (file.endsWith(".ts") || file.endsWith(".js"))
  )
  .map((file) => require(`./${file}`).default);

export default schema;
