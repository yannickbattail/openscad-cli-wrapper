import * as path from "node:path";
import fs from "node:fs";
import { customAlphabet } from "nanoid";

import { ParameterDefinition } from "./ParameterDefinition.js";
import { ParameterFileSet, ParameterKV, ParameterSet, ParameterSetName } from "./ParameterSet.js";
import { OpenScadOutputWithParameterDefinition, OpenScadOutputWithSummary, Summary } from "./OpenScadOutput.js";
import {
  Export2dFormat,
  Export3dFormat,
  ExportFormat,
  ExportTextFormat,
  IAnimOptions,
  IExperimentalFeatures,
  IImageOptions,
  IOpenScadOptions,
  IOption3mf,
  IOptionPdf,
  IOptionSvg,
} from "./IOpenScadOptions.js";
import { esc } from "../util/execBash.js";

export type Executor = (cmd: string) => Promise<string>;

export class OpenScad {
  nanoid = customAlphabet("1234567890abcdef", 10);

  constructor(
    private filePath: string,
    private outputDir: string,
    private exec: Executor,
  ) {}

  public async getParameterDefinition(options: IOpenScadOptions): Promise<OpenScadOutputWithParameterDefinition> {
    const outFile = this.getFileByFormat(ExportTextFormat.param, "");
    const out = await this.exec(
      `${options.openScadExecutable} ${this.buildOpenscadOptions(options)} --export-format ${ExportTextFormat.param} -o ${outFile} ${this.filePath}`,
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
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(Export2dFormat.png, paramSet.parameterName);
    const summary = new Summary(paramSet.parameterFile);
    const out = await this.exec(
      `${options.openScadExecutable} ${this.buildOpenscadOptions(options)} ${this.buildImageOptions(options.imageOptions)} ${summary.getArg()} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} -o ${outFile} ${this.filePath}`,
    );
    this.cleanParameterFile(params, paramSet);
    return {
      output: out,
      modelFile: this.filePath,
      summary: summary.getSummary(),
      file: outFile,
    };
  }

  public async generateAnimation(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(Export2dFormat.png, paramSet.parameterName, true);
    const outFilePattern = outFile.replace(".png", "*.png");
    const summary = new Summary(paramSet.parameterFile);
    const out = await this.exec(
      `${options.openScadExecutable} ${this.buildOpenscadOptions(options)} ${(this, this.buildAnimOption(options.animOptions))} ${summary.getArg()} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} -o ${outFile} ${this.filePath}`,
    );
    this.cleanParameterFile(params, paramSet);
    return {
      output: out,
      modelFile: this.filePath,
      summary: summary.getSummary(),
      file: outFilePattern,
    };
  }

  public async generateModel(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export3dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    return this.generate2d3d(params, format, options);
  }

  public async generate2d(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export2dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    return this.generate2d3d(params, format, options);
  }

  private async generate2d3d(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export2dFormat | Export3dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(format, paramSet.parameterName);
    const summary = new Summary(paramSet.parameterFile);
    const formatOptions = this.getFormatOption(format, options);
    const out = await this.exec(
      `${options.openScadExecutable} ${this.buildOpenscadOptions(options)} ${formatOptions} ${summary.getArg()} -p ${paramSet.parameterFile} -P ${paramSet.parameterName} --export-format ${format} -o ${outFile} ${this.filePath}`,
    );
    this.cleanParameterFile(params, paramSet);
    return {
      output: out,
      modelFile: this.filePath,
      summary: summary.getSummary(),
      file: outFile,
    };
  }

  private getFormatOption(format: Export3dFormat | Export2dFormat, options: IOpenScadOptions): string {
    switch (format) {
      case Export3dFormat["3mf"]:
        return this.buildFormatOptions(options.option3mf, format);
      case Export2dFormat.pdf:
        return this.buildFormatOptions(options.optionPdf, format);
      case Export2dFormat.svg:
        return this.buildFormatOptions(options.optionSvg, format);
      default:
        return "";
    }
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

  private buildOpenscadOptions(option: IOpenScadOptions): string {
    let opt = `--backend ${option.backend}`;
    opt += this.buildExperimentalFeatures(option.experimentalFeatures);
    opt += option.quiet ? " --quiet" : "";
    opt += option.hardwarnings ? " --hardwarnings" : "";
    opt += option.check_parameters ? " --check-parameters" : "";
    opt += option.check_parameter_ranges ? " --check-parameter-ranges" : "";
    opt += option.debug ? ` --debug '${option.debug}'` : "";
    opt += option.trust_python ? " --trust-python" : "";
    opt += option.python_module ? ` --python-module '${esc(option.python_module)}'` : "";
    return opt;
  }

  private buildExperimentalFeatures(experimentalFeatures: IExperimentalFeatures) {
    return Object.entries(experimentalFeatures)
      .filter(([, value]) => value)
      .map(([key]) => ` --enable ${key.replaceAll("_", "-")}`)
      .join(" ");
  }

  private buildImageOptions(imgOptions: IImageOptions): string {
    let opt = " --export-format png";
    opt += imgOptions.imgsize ? ` --imgsize ${imgOptions.imgsize.width},${imgOptions.imgsize.height}` : "";
    if (imgOptions.camera) {
      if ("translate" in imgOptions.camera) {
        opt += ` --camera ${imgOptions.camera.translate?.x},${imgOptions.camera.translate?.y},${imgOptions.camera.translate?.z},${imgOptions.camera.rotate?.x},${imgOptions.camera.rotate?.y},${imgOptions.camera.rotate?.z},${imgOptions.camera.dist}`;
      } else {
        opt += ` --camera ${imgOptions.camera.eye?.x},${imgOptions.camera.eye?.y},${imgOptions.camera.eye?.z},${imgOptions.camera.center?.x},${imgOptions.camera.center?.y},${imgOptions.camera.center?.z}`;
      }
    }
    opt += imgOptions.autocenter ? " --autocenter" : "";
    opt += imgOptions.viewall ? " --viewall" : "";
    opt += imgOptions.view ? ` --view ${imgOptions.view}` : "";
    opt += imgOptions.projection ? ` --projection ${imgOptions.projection}` : "";
    opt += imgOptions.colorscheme ? ` --colorscheme ${imgOptions.colorscheme}` : "";
    opt += imgOptions.render ? " --render" : "";
    opt += imgOptions.csglimit ? ` --csglimit ${imgOptions.csglimit}` : "";
    opt += imgOptions.preview ? ` --preview ${imgOptions.preview}` : "";
    return opt;
  }

  private buildAnimOption(animOptions: IAnimOptions): string {
    let opt = this.buildImageOptions(animOptions);
    opt += animOptions.animate ? ` --animate ${animOptions.animate}` : "";
    opt += animOptions.animate_sharding
      ? ` --animate-sharding ${animOptions.animate_sharding.shard}/${animOptions.animate_sharding.num_shards}`
      : "";
    return opt;
  }

  private buildFormatOptions(option: IOption3mf | IOptionPdf | IOptionSvg, format: Export3dFormat | Export2dFormat) {
    return Object.entries(option)
      .map(([key, value]) => `-O 'export-${format}/${key.replaceAll("_", "-")}=${"" + esc(value)}'`)
      .join(" ");
  }
}
