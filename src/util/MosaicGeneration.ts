import { ParameterFileSet } from "../openscad/ParameterSet.js";

export function GenerateMosaic(parameterFileSet: ParameterFileSet) {
  // montage ${imagemagick_debug} -geometry "${image_mosaic_geometry}" -tile "${image_mosaic_tile}" "${jpg_dir}/"*.png "${jpg_dir}/mosaic_${scad_file_name}.jpg"
  // let output = execOutput(
  //   `img2webp -o "${output.file}" -d "${animDelay}" ${animImagesPattern}`,
  // );
  // output += execOutput(`rm ${animImagesPattern}`);
  // return {
  //   output: output,
  //   modelFile: parameterFileSet.parameterFile,
  //   summary: '',
  //   file: outFile,
  // };
}
