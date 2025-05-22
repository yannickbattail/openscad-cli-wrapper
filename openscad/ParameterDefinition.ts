export interface OptionNumber {
  name: string;
  value: number;
}

export interface OptionString {
  name: string;
  value: string;
}

export interface ParameterBase {
  name: string;
  caption?: string;
  group?: string;
}

export interface ParameterNumber extends ParameterBase {
  type: "number";
  initial: number | number[];
  max?: number;
  min?: number;
  step?: number;
}

export interface ParameterNumberOption extends ParameterBase {
  type: "number";
  initial: number | number[];
  options: OptionNumber[];
  max?: number;
  min?: number;
  step?: number;
}

export interface ParameterString extends ParameterBase {
  type: "string";
  initial: string;
  maxLength?: number;
}

export interface ParameterStringOption extends ParameterBase {
  type: "string";
  initial: string;
  options: OptionString[];
}

export interface ParameterBoolean extends ParameterBase {
  type: "boolean";
  initial: boolean;
}

export interface ParameterDefinition {
  parameters: (
    | ParameterNumber
    | ParameterNumberOption
    | ParameterString
    | ParameterStringOption
    | ParameterBoolean
  )[];
  title: string;
}
