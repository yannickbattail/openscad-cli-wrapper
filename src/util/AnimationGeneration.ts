import { execOutput } from "./execBash";
import {OpenScadOutputWithSummary} from "../openscad/OpenScadOutput";

export function GenerateAnimation(
  output: OpenScadOutputWithSummary,
  animDelay: number,
) {
  const animImagesPattern = output.file;
  output.file = animImagesPattern
    .replace("*.png", ".webp")
    .replace("_animation", "");
  output.output += execOutput(
    `img2webp -o "${output.file}" -d "${animDelay}" ${animImagesPattern}`,
  );
  output.output += execOutput(`rm ${animImagesPattern}`);
  return output;
}
