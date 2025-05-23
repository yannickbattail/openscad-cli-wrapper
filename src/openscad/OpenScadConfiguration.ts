import {
  AnimOptions,
  ColorScheme,
  ExperimentalFeatures,
  ImageOptions,
  OpenScadOptions,
  Option3mf,
} from "./OpenScadOptions";

export const modelFile = "openscadFiles/model.scad";
export const retentionTime = 1000 * 60 * 10; // 10 min

const scadOptions = new OpenScadOptions({
  outputDir: "../src/gen",
  backend: "Manifold",
  quiet: false,
  hardwarnings: false,
  check_parameters: false,
  check_parameter_ranges: false,
  debug: null,
  trust_python: false,
  python_module: null,
  experimentalFeatures: new ExperimentalFeatures({
    import_function: true,
    predictible_output: true,
    python_engine: false,
    input_driver_dbus: false,
    lazy_union: true,
    roof: true,
    textmetrics: true,
    vertex_object_renderers_indexing: true,
  }),
});

const imgOpt = {
  colorscheme: ColorScheme.DeepOcean,
  imgsize: {
    width: 256,
    height: 512,
  },
  animate: 50,
  animDelay: 100,
};

export const imageOptions = new ImageOptions(imgOpt);
export const animOptions = new AnimOptions(imgOpt);

export const option3mf = new Option3mf({
  color_mode: "model",
  material_type: "color",
  color: "",
  unit: "millimeter",
  decimal_precision: "6",
  add_meta_data: "true",
  meta_data_title: "light saber",
  meta_data_description: "Customisable light saber",
  meta_data_copyright: "Xcinnay",
  meta_data_designer: "Xcinnay",
  meta_data_license_terms: "CC BY-NC-ND",
  meta_data_rating: "1",
});

export function getOptions(): OpenScadOptions {
  return new OpenScadOptions({
    ...scadOptions,
    randomOutput: "" + new Date().getTime(),
  });
}
