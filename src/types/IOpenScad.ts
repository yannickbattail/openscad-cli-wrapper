import {
  Export2dFormat,
  Export3dFormat,
  ExportFormat,
  IAnimOptions,
  IExperimentalFeatures,
  IImageOptions,
  IOpenScadOptions,
  IOption3mf,
  IOptionPdf,
  IOptionSvg,
} from "./IOpenScadOptions.js";
import { ParameterFileSet, ParameterKV, ParameterSetName } from "./ParameterSet.js";
import { OpenScadOutputWithParameterDefinition, OpenScadOutputWithSummary } from "./OpenScadSummary.js";

export type Executor = (cmd: string) => Promise<string>;

export interface IOpenScad {
  getParameterDefinition(options: IOpenScadOptions): Promise<OpenScadOutputWithParameterDefinition>;

  generateImage(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary>;

  generateAnimation(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary>;

  generateModel(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export3dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary>;

  generate2d(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export2dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary>;

  generate2d3d(
    params: ParameterFileSet | ParameterSetName | ParameterKV[],
    format: Export2dFormat | Export3dFormat,
    options: IOpenScadOptions,
  ): Promise<OpenScadOutputWithSummary>;

  getFormatOption(format: Export3dFormat | Export2dFormat, options: IOpenScadOptions): string;

  getFileFormatExtension(format: ExportFormat): string;

  getFileByFormat(format: ExportFormat, suffix: string, forAnim: boolean): string;

  toParameterFile(params: ParameterFileSet | ParameterSetName | ParameterKV[]): ParameterFileSet;

  cleanParameterFile(
    paramsOriginal: ParameterFileSet | ParameterSetName | ParameterKV[],
    paramsNew: ParameterFileSet,
  ): void;

  buildOpenscadOptions(option: IOpenScadOptions): string;

  buildExperimentalFeatures(experimentalFeatures: IExperimentalFeatures): string;

  buildImageOptions(imgOptions: IImageOptions): string;

  buildAnimOption(animOptions: IAnimOptions): string;

  buildFormatOptions(option: IOption3mf | IOptionPdf | IOptionSvg, format: Export3dFormat | Export2dFormat): string;
}
