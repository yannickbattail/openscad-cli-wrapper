import { Executor } from "../types/IOpenScad.js";
import { MosaicOptions } from "../types/IOpenScadOptions.js";

export async function GenerateMosaic(
  files: string[],
  mosaicFile: string,
  mosaicOptions: MosaicOptions,
  debug: boolean,
  executor: Executor,
): Promise<void> {
  const geometry = `${mosaicOptions.geometry?.width}x${mosaicOptions.geometry?.height}+${mosaicOptions.geometry?.border}+${mosaicOptions.geometry?.border}`;
  const tiles = `${mosaicOptions.tiles?.width}x${mosaicOptions.tiles?.height}`;
  await executor([
    "montage",
    ...(debug ? ["-verbose"] : []),
    ...["-geometry", geometry],
    ...["-tile", tiles],
    ...files,
    mosaicFile,
  ]);
}
