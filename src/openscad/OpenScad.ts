import path from "node:path";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { customAlphabet } from "nanoid";

import { ParameterDefinition } from "../types/ParameterDefinition.js";
import { ParameterFileSet, ParameterKV, ParameterSetName } from "../types/ParameterSet.js";
import { Summary } from "./Summary.js";
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
} from "../types/IOpenScadOptions.js";
import { Executor, IOpenScad } from "../types/IOpenScad.js";
import { OpenScadOutputWithParameterDefinition, OpenScadOutputWithSummary } from "../types/OpenScadSummary.js";
import { ParameterSetLoader } from "./ParameterSetLoader.js";

export class OpenScad implements IOpenScad {
  private nanoid = customAlphabet("1234567890abcdef", 10);

  constructor(
    private filePath: string,
    private outputDir: string,
    private exec: Executor,
  ) {}

  async getParameterDefinition(options: IOpenScadOptions): Promise<OpenScadOutputWithParameterDefinition> {
    const outFile = this.getFileByFormat(ExportTextFormat.param, "");

    const out = await this.exec([
      options.openScadExecutable,
      ...this.buildOpenscadOptions(options),
      ...["--export-format", ExportTextFormat.param],
      ...["-o", outFile],
      this.filePath,
    ]);
    const paramDef: ParameterDefinition = JSON.parse(readFileSync(outFile, "utf8")) as ParameterDefinition;
    return {
      output: out.stdout + " " + out.stderr,
      modelFile: this.filePath,
      file: outFile,
      parameterDefinition: paramDef,
    };
  }

  async generateImage(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(Export2dFormat.png, paramSet.parameterName);
    const summary = new Summary(paramSet.parameterFile);
    const out = await this.exec([
      options.openScadExecutable,
      ...this.buildOpenscadOptions(options),
      ...this.buildImageOptions(options.imageOptions),
      ...summary.buildArgs(),
      ...["-p", paramSet.parameterFile],
      ...["-P", paramSet.parameterName],
      ...["-o", outFile],
      this.filePath,
    ]);
    this.cleanParameterFile(params, paramSet);
    return {
      output: out.stdout + " " + out.stderr,
      modelFile: this.filePath,
      summary: summary.getSummary(),
      file: outFile,
    };
  }

  async generateAnimation(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(Export2dFormat.png, paramSet.parameterName, true);
    const outFilePattern = outFile.replace(".png", "*.png");
    const summary = new Summary(paramSet.parameterFile);
    const out = await this.exec([
      options.openScadExecutable,
      ...this.buildOpenscadOptions(options),
      ...this.buildAnimOption(options.animOptions),
      ...summary.buildArgs(),
      ...["-p", paramSet.parameterFile],
      ...["-P", paramSet.parameterName],
      ...["-o", outFile],
      this.filePath,
    ]);
    this.cleanParameterFile(params, paramSet);
    return {
      output: out.stdout + " " + out.stderr,
      modelFile: this.filePath,
      summary: summary.getSummary(),
      file: outFilePattern,
    };
  }

  async generateModel(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export3dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    return this.generate2d3d(params, format, options);
  }

  async generate2d(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export2dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    return this.generate2d3d(params, format, options);
  }

  async generate2d3d(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export2dFormat | Export3dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary> {
    const paramSet = this.toParameterFile(params);
    const outFile = this.getFileByFormat(format, paramSet.parameterName);
    const summary = new Summary(paramSet.parameterFile);
    const out = await this.exec([
      options.openScadExecutable,
      ...this.buildOpenscadOptions(options),
      ...this.getFormatOption(format, options),
      ...summary.buildArgs(),
      ...["-p", paramSet.parameterFile],
      ...["-P", paramSet.parameterName],
      ...["--export-format", format],
      ...["-o", outFile],
      this.filePath,
    ]);

    this.cleanParameterFile(params, paramSet);
    return {
      output: out.stdout + " " + out.stderr,
      modelFile: this.filePath,
      summary: summary.getSummary(),
      file: outFile,
    };
  }

  getFormatOption(format: Export3dFormat | Export2dFormat, options: IOpenScadOptions): string[] {
    switch (format) {
      case Export3dFormat["3mf"]:
        return this.buildFormatOptions(options.option3mf, format);
      case Export2dFormat.pdf:
        return this.buildFormatOptions(options.optionPdf, format);
      case Export2dFormat.svg:
        return this.buildFormatOptions(options.optionSvg, format);
      default:
        return [];
    }
  }

  getFileFormatExtension(format: ExportFormat): string {
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

  getFileByFormat(format: ExportFormat, suffix: string, forAnim: boolean = false): string {
    return path.join(
      this.outputDir,
      `${path.parse(this.filePath).name}${suffix ? "_" + suffix : ""}${forAnim ? "_animImg" : ""}.${this.getFileFormatExtension(format)}`,
    );
  }

  toParameterFile(params: ParameterFileSet | ParameterSetName | ParameterKV[]): ParameterFileSet {
    if ("parameterFile" in params) {
      return params;
    } else if ("parameterSet" in params) {
      const file = this.getFileByFormat(ExportTextFormat.paramSet, params.parameterName + "_" + this.nanoid());
      writeFileSync(file, JSON.stringify(params.parameterSet));
      return {
        parameterFile: file,
        parameterName: params.parameterName,
      };
    } else {
      const file = this.getFileByFormat(ExportTextFormat.paramSet, this.nanoid());
      writeFileSync(file, JSON.stringify(ParameterSetLoader.toParameterSet(params)));
      return {
        parameterFile: file,
        parameterName: "model",
      };
    }
  }

  cleanParameterFile(
    paramsOriginal: ParameterFileSet | ParameterSetName | ParameterKV[],
    paramsNew: ParameterFileSet,
  ): void {
    if ("parameterFile" in paramsOriginal) {
      return;
    } else if ("parameterSet" in paramsOriginal) {
      rmSync(paramsNew.parameterFile);
    } else {
      rmSync(paramsNew.parameterFile);
    }
  }

  buildOpenscadOptions(option: IOpenScadOptions): string[] {
    const opt: string[] = [
      ...[`--backend`, option.backend],
      ...this.buildExperimentalFeatures(option.experimentalFeatures),
    ];
    if (option.quiet) opt.push("--quiet");
    if (option.hardwarnings) opt.push("--hardwarnings");
    if (option.check_parameters) opt.push("--check-parameters");
    if (option.check_parameter_ranges) opt.push("--check-parameter-ranges");
    if (option.debug) opt.push(`--debug`, option.debug ? "true" : "false");
    if (option.trust_python) opt.push("--trust-python");
    if (option.python_module) opt.push(`--python-module`, option.python_module);
    return opt;
  }

  buildExperimentalFeatures(experimentalFeatures: IExperimentalFeatures): string[] {
    return Object.entries(experimentalFeatures)
      .filter(([, value]) => value)
      .map(([key]) => ["--enable", key.replaceAll("_", "-")])
      .flat();
  }

  buildImageOptions(imgOptions: IImageOptions): string[] {
    const opt: string[] = ["--export-format", "png"];
    if (imgOptions.imgsize) opt.push(`--imgsize`, `${imgOptions.imgsize.width},${imgOptions.imgsize.height}`);
    if (imgOptions.camera) {
      if ("translate" in imgOptions.camera) {
        opt.push(
          `--camera`,
          `${imgOptions.camera.translate?.x},${imgOptions.camera.translate?.y},${imgOptions.camera.translate?.z},${imgOptions.camera.rotate?.x},${imgOptions.camera.rotate?.y},${imgOptions.camera.rotate?.z},${imgOptions.camera.dist}`,
        );
      } else {
        opt.push(
          `--camera`,
          `${imgOptions.camera.eye?.x},${imgOptions.camera.eye?.y},${imgOptions.camera.eye?.z},${imgOptions.camera.center?.x},${imgOptions.camera.center?.y},${imgOptions.camera.center?.z}`,
        );
      }
    }
    if (imgOptions.autocenter) opt.push("--autocenter");
    if (imgOptions.viewall) opt.push("--viewall");
    if (imgOptions.view) opt.push(`--view`, imgOptions.view);
    if (imgOptions.projection) opt.push(`--projection`, imgOptions.projection);
    if (imgOptions.colorscheme) opt.push(`--colorscheme`, imgOptions.colorscheme);
    if (imgOptions.render) opt.push("--render");
    if (imgOptions.csglimit) opt.push(`--csglimit`, imgOptions.csglimit.toString());
    if (imgOptions.preview) opt.push(`--preview`, imgOptions.preview);
    return opt;
  }

  buildAnimOption(animOptions: IAnimOptions): string[] {
    const opt: string[] = this.buildImageOptions(animOptions);
    if (animOptions.animate) opt.push(`--animate`, animOptions.animate.toString());
    if (animOptions.animate_sharding)
      opt.push(
        `--animate-sharding`,
        `${animOptions.animate_sharding.shard}/${animOptions.animate_sharding.num_shards}`,
      );
    return opt;
  }

  buildFormatOptions(option: IOption3mf | IOptionPdf | IOptionSvg, format: Export3dFormat | Export2dFormat): string[] {
    return Object.entries(option)
      .map(([key, value]) => [`-O`, `export-${format}/${key.replaceAll("_", "-")}=${value}`])
      .flat();
  }
}
