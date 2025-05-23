import { JSONSchemaType } from "ajv";
import { ParameterKV } from "../openscad/ParameterSet.js";

export const openscadParameterKvSchema: JSONSchemaType<ParameterKV[]> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "ParameterKVArray",
  type: "array",
  items: {
    type: "object",
    properties: {
      parameter: {
        type: "string",
      },
      value: {
        type: "string",
      },
    },
    required: ["parameter", "value"],
    additionalProperties: false,
  },
};
