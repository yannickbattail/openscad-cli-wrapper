import { glob } from "glob";
import { OpenScadOutputWithSummary } from "../types/OpenScadSummary.js";
import { Executor } from "../types/IOpenScad.js";

export async function GenerateWebpAnimation(
  output: OpenScadOutputWithSummary,
  animDelay: number,
  debug: boolean,
  executor: Executor,
): Promise<OpenScadOutputWithSummary> {
  const animImagesPattern = output.file;
  output.file = animImagesPattern.replace("*.png", ".webp").replace("_animation", "");
  const outputGen = await executor([
    `img2webp`,
    ...(debug ? ["-v"] : []),
    ...[`-o`, output.file],
    ...[`-d`, animDelay.toString()],
    ...glob.sync(animImagesPattern),
  ]);
  output.output += outputGen.stdout + "" + outputGen.stderr;
  const outputRm = await executor([`rm`, ...glob.sync(animImagesPattern)]);
  output.output += outputRm.stdout + "" + outputRm.stderr;
  return output;
}

export async function GenerateGifAnimation(
  output: OpenScadOutputWithSummary,
  animDelay: number,
  debug: boolean,
  executor: Executor,
): Promise<OpenScadOutputWithSummary> {
  const animImagesPattern = output.file;
  output.file = animImagesPattern.replace("*.png", ".gif").replace("_animation", "");
  const outputGen = await executor([
    `convert`,
    ...(debug ? ["-verbose"] : []),
    ...[`-delay`, (animDelay * 10).toString()],
    ...[`-loop`, "0"],
    ...glob.sync(animImagesPattern),
    output.file,
  ]);
  output.output += outputGen.stdout + "" + outputGen.stderr;
  const outputRm = await executor([`rm`, ...glob.sync(animImagesPattern)]);
  output.output += outputRm.stdout + "" + outputRm.stderr;
  return output;
}
