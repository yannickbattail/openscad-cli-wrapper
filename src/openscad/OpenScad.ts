import * as path from "node:path";
import fs from "node:fs";
import { customAlphabet } from "nanoid";

import { Export2dFormat, Export3dFormat, ExportFormat, ExportTextFormat, OpenScadOptions } from "./OpenScadOptions.js";
import { ParameterDefinition } from "./ParameterDefinition.js";
import { ParameterFileSet, ParameterKV, ParameterSet, ParameterSetName } from "./ParameterSet.js";
import { ModelSummary } from "./OpenScadSummary.js";
import { OpenScadOutputWithParameterDefinition, OpenScadOutputWithSummary } from "./OpenScadOutput.js";

export type Executor = (cmd: string) => Promise<string>;

export class OpenScad {
  nanoid = customAlphabet("1234567890abcdef", 10);

  constructor(
    private filePath: string,
    private outputDir: string,
    private exec: Executor,
  ) {}

  public async getParameterDefinition(options: OpenScadOptions): Promise<OpenScadOutputWithParameterDefinition> {
    const outFile = this.getFileByFormat(ExportTextFormat.param, "");
    const out = await this.exec(
      `${options.openScadExecutable} ${options.getOptions()} --export-format ${ExportTextFormat.param} -o ${outFile} ${this.filePath}`,
    );
    const paramDef: ParameterDefinition = JSON.parse(fs.readFileSync(outFile, "utf8")) as ParameterDefinition;
    return {
      output: out,
      modelFile: this.filePath,
      file: outFile,
      parameterDefinition: paramDef,
    };
  }

  public async generateImage(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    options: OpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(Export2dFormat.png, paramSet.parameterName);
    const summaryFile = this.getFileByFormat(ExportTextFormat.summary, paramSet.parameterName);
    const out = await this.exec(
      `${options.openScadExecutable} ${options.getOptions()} ${options.imageOptions.getOptions()} --summary all --summary-file ${summaryFile} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} -o ${outFile} ${this.filePath}`,
    );
    const summary = JSON.parse(fs.readFileSync(summaryFile, "utf8")) as ModelSummary;
    this.cleanParameterFile(params, paramSet);
    fs.rmSync(summaryFile);
    return {
      output: out,
      modelFile: this.filePath,
      summary: summary,
      file: outFile,
    };
  }

  public async generateAnimation(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    options: OpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(Export2dFormat.png, paramSet.parameterName, true);
    const outFilePattern = outFile.replace(".png", "*.png");
    const summaryFile = this.getFileByFormat(ExportTextFormat.summary, paramSet.parameterName);
    const out = await this.exec(
      `${options.openScadExecutable} ${options.getOptions()} ${options.animOptions.getOptions()} --summary all --summary-file ${summaryFile} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} -o ${outFile} ${this.filePath}`,
    );
    const summary = JSON.parse(fs.readFileSync(summaryFile, "utf8")) as ModelSummary;
    this.cleanParameterFile(params, paramSet);
    fs.rmSync(summaryFile);
    return {
      output: out,
      modelFile: this.filePath,
      summary: summary,
      file: outFilePattern,
    };
  }

  public async generateModel(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export3dFormat,
    options: OpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(format, paramSet.parameterName);
    const summaryFile = this.getFileByFormat(ExportTextFormat.summary, paramSet.parameterName);
    const out = await this.exec(
      `${options.openScadExecutable} ${options.getOptions()} ${options.option3mf.getOptions()} --summary all --summary-file ${summaryFile} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} --export-format ${format} -o ${outFile} ${this.filePath}`,
    );
    const summary = JSON.parse(fs.readFileSync(summaryFile, "utf8")) as ModelSummary;
    this.cleanParameterFile(params, paramSet);
    fs.rmSync(summaryFile);
    return {
      output: out,
      modelFile: this.filePath,
      summary: summary,
      file: outFile,
    };
  }

  private getFileFormatExtension(format: ExportFormat): string {
    switch (format) {
      case "asciistl":
      case "binstl":
        return "stl";
      case "paramSet":
        return "json";
      case "param":
        return "param.json";
      case "summary":
        return "summary.json";
      default:
        return format;
    }
  }

  private getFileByFormat(format: ExportFormat, suffix: string, forAnim: boolean = false): string {
    return path.join(
      this.outputDir,
      `${path.parse(this.filePath).name}${suffix ? "_" + suffix : ""}${forAnim ? "_animImg" : ""}.${this.getFileFormatExtension(format)}`,
    );
  }

  private toParameterFile(params: ParameterFileSet | ParameterSetName | ParameterKV[]): ParameterFileSet {
    if ("parameterFile" in params) {
      return params;
    } else if ("parameterSet" in params) {
      const file = this.getFileByFormat(ExportTextFormat.paramSet, params.parameterName + "_" + this.nanoid());
      fs.writeFileSync(file, JSON.stringify(params.parameterSet));
      return {
        parameterFile: file,
        parameterName: params.parameterName,
      };
    } else {
      const file = this.getFileByFormat(ExportTextFormat.paramSet, this.nanoid());
      fs.writeFileSync(file, JSON.stringify(ParameterSet.toParameterSet(params)));
      return {
        parameterFile: file,
        parameterName: "model",
      };
    }
  }

  private cleanParameterFile(
    paramsOriginal: ParameterFileSet | ParameterSetName | ParameterKV[],
    paramsNew: ParameterFileSet,
  ): void {
    if ("parameterFile" in paramsOriginal) {
      return;
    } else if ("parameterSet" in paramsOriginal) {
      fs.rmSync(paramsNew.parameterFile);
    } else {
      fs.rmSync(paramsNew.parameterFile);
    }
  }
}
