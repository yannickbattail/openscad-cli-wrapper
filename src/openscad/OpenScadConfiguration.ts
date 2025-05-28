import {
  AnimOptions,
  ColorScheme,
  ExperimentalFeatures,
  ImageOptions,
  OpenScadOptions,
  Option3mf,
} from "./OpenScadOptions.js";

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
  imageOptions: new ImageOptions({
    colorscheme: ColorScheme.DeepOcean,
    imgsize: {
      width: 1024,
      height: 1024,
    },
  }),
  animOptions: new AnimOptions({
    colorscheme: ColorScheme.DeepOcean,
    imgsize: {
      width: 512,
      height: 512,
    },
    animate: 20,
    animDelay: 50,
  }),
  Option3mf: new Option3mf({
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
  }),
});

export function getOptions(): OpenScadOptions {
  return new OpenScadOptions({
    ...scadOptions,
  });
}
