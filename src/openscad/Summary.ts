import { ISummary, ModelSummary } from "../types/OpenScadSummary.js";
import fs from "node:fs";
import { customAlphabet } from "nanoid";

export class Summary implements ISummary {
  nanoid = customAlphabet("1234567890abcdef", 10);
  private readonly summaryFile: string;

  constructor(outFile: string) {
    this.summaryFile = `${outFile}.summary${this.nanoid()}.json`;
  }

  getArg() {
    return `--summary all --summary-file '${this.summaryFile}'`;
  }

  getSummary(): ModelSummary {
    const summaryFile = this.summaryFile;
    if (!fs.existsSync(summaryFile)) {
      throw new Error(`Summary file ${summaryFile} does not exist.`);
    }
    const summary: ModelSummary = JSON.parse(fs.readFileSync(summaryFile, "utf8")) as ModelSummary;
    fs.rmSync(summaryFile);
    return summary;
  }
}
