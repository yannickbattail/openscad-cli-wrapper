import fs from "node:fs";
import { ParameterKV, ParameterSet } from "../types/ParameterSet.js";

export class ParameterSetLoader {
  public static createFromFile(filePath: string): ParameterSet {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as ParameterSet;
  }

  public static writeToFile(filePath: string) {
    fs.writeFileSync(filePath, JSON.stringify(this, null, 2), "utf8");
  }

  public static toParameterSet(paramKV: ParameterKV[], name: string = "model"): ParameterSet {
    const parameterSet = new ParameterSet();
    parameterSet.add(name, paramKV);
    return parameterSet;
  }
}
