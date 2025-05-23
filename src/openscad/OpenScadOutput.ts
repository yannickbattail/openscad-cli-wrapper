import { ModelSummary } from "./OpenScadSummary";
import { ParameterDefinition } from "./ParameterDefinition";

export interface OpenScadOutput {
  output: string;
  modelFile: string;
  file: string;
}

export interface OpenScadOutputWithSummary extends OpenScadOutput {
  summary: ModelSummary;
}

export interface OpenScadOutputWithParameterDefinition extends OpenScadOutput {
  parameterDefinition: ParameterDefinition;
}
