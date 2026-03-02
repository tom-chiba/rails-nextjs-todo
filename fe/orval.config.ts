import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "../be/swagger/v1/swagger.yaml",
    },
    output: {
      mode: "split",
      target: "./app/generated/api-client",
      schemas: "./app/generated/models",
      client: "react-query",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "./app/lib/api-client.ts",
          name: "customFetch",
        },
      },
    },
  },
});
