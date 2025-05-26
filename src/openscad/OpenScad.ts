import * as path from "node:path";
import fs from "node:fs";

import {
  AnimOptions,
  Export2dFormat,
  Export3dFormat,
  ExportFormat,
  ExportTextFormat,
  ImageOptions,
  OpenScadOptions,
  Option3mf,
} from "./OpenScadOptions.js";
import { ParameterDefinition } from "./ParameterDefinition.js";
import {
  ParameterFileSet,
  ParameterKV,
  ParameterSet,
  ParameterSetName,
} from "./ParameterSet.js";
import { ModelSummary } from "./OpenScadSummary.js";
import {
  OpenScadOutputWithParameterDefinition,
  OpenScadOutputWithSummary,
} from "./OpenScadOutput.js";

export class OpenScad {
  constructor(
    private filePath: string,
    private options: OpenScadOptions,
    private exec: (cmd: string) => Promise<string>,
  ) {}

  public async getParameterDefinition(): Promise<OpenScadOutputWithParameterDefinition> {
    const outFile = this.getFileByFormat(ExportTextFormat.param);
    const out = await this.exec(
      `${this.options.openScadExecutable} ${this.options.getOptions()} --export-format ${ExportTextFormat.param} -o ${outFile} ${this.filePath}`,
    );
    const paramDef: ParameterDefinition = JSON.parse(
      fs.readFileSync(outFile, "utf8"),
    ) as ParameterDefinition;
    return {
      output: out,
      modelFile: this.filePath,
      file: outFile,
      parameterDefinition: paramDef,
    };
  }

  public async generateImage(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    imageOptions: ImageOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(Export2dFormat.png);
    const summaryFile = this.getFileByFormat(ExportTextFormat.summary);
    const out = await this.exec(
      `${this.options.openScadExecutable} ${this.options.getOptions()} ${imageOptions.getOptions()} --summary all --summary-file ${summaryFile} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} -o ${outFile} ${this.filePath}`,
    );
    const summary = JSON.parse(
      fs.readFileSync(summaryFile, "utf8"),
    ) as ModelSummary;
    return {
      output: out,
      modelFile: this.filePath,
      summary: summary,
      file: outFile,
    };
  }

  public async generateAnimation(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    animOptions: AnimOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(Export2dFormat.png);
    const outFilePattern = outFile.replace(".png", "*.png");
    const summaryFile = this.getFileByFormat(ExportTextFormat.summary);
    const out = await this.exec(
      `${this.options.openScadExecutable} ${this.options.getOptions()} ${animOptions.getOptions()} --summary all --summary-file ${summaryFile} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} -o ${outFile} ${this.filePath}`,
    );
    const summary = JSON.parse(
      fs.readFileSync(summaryFile, "utf8"),
    ) as ModelSummary;
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
    option3mf: Option3mf | null,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(format);
    const summaryFile = this.getFileByFormat(ExportTextFormat.summary);
    const out = await this.exec(
      `${this.options.openScadExecutable} ${this.options.getOptions()} ${option3mf?.getOptions()} --summary all --summary-file ${summaryFile} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} --export-format ${format} -o ${outFile} ${this.filePath}`,
    );
    const summary = JSON.parse(
      fs.readFileSync(summaryFile, "utf8"),
    ) as ModelSummary;
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

  private getFileByFormat(format: ExportFormat): string {
    return path.join(
      this.options.outputDir,
      `${path.parse(this.filePath).name}${this.options.suffix ? "_" + this.options.suffix : ""}.${this.getFileFormatExtension(format)}`,
    );
  }

  private toParameterFile(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
  ): ParameterFileSet {
    if ("parameterFile" in params) {
      return params;
    } else if ("parameterSet" in params) {
      const file = this.getFileByFormat(ExportTextFormat.paramSet);
      fs.writeFileSync(file, JSON.stringify(params.parameterSet));
      return {
        parameterFile: file,
        parameterName: params.parameterName,
      };
    } else {
      const file = this.getFileByFormat(ExportTextFormat.paramSet);
      fs.writeFileSync(
        file,
        JSON.stringify(ParameterSet.toParameterSet(params)),
      );
      return {
        parameterFile: file,
        parameterName: "model",
      };
    }
  }
}
