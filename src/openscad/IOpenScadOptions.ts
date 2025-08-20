export interface IOpenScadOptions {
  openScadExecutable: string;
  backend: "CGAL" | "Manifold";
  experimentalFeatures: IExperimentalFeatures;
  quiet: boolean;
  hardwarnings: boolean;
  check_parameters: boolean;
  check_parameter_ranges: boolean;
  debug: boolean | null;
  trust_python: boolean;
  python_module: string | null;
  imageOptions: IImageOptions;
  animOptions: IAnimOptions;
  option3mf: IOption3mf;
}

export interface IExperimentalFeatures {
  roof: boolean;
  input_driver_dbus: boolean;
  lazy_union: boolean;
  vertex_object_renderers_indexing: boolean;
  textmetrics: boolean;
  import_function: boolean;
  object_function: boolean;
  predictible_output: boolean;
  python_engine: boolean;
}

export interface ICameraPosition {
  translate: { x: number; y: number; z: number } | undefined;
  rotate: { x: number; y: number; z: number } | undefined;
  dist: number | undefined;
}

export interface ICameraEye {
  eye: { x: number; y: number; z: number } | undefined;
  center: { x: number; y: number; z: number } | undefined;
}

export enum ColorScheme {
  "Cornfield" = "Cornfield",
  "Metallic" = "Metallic",
  "Sunset" = "Sunset",
  "Starnight" = "Starnight",
  "BeforeDawn" = "BeforeDawn",
  "Nature" = "Nature",
  "Daylight Gem" = "Daylight Gem",
  "Nocturnal Gem" = "Nocturnal Gem",
  "DeepOcean" = "DeepOcean",
  "Solarized" = "Solarized",
  "Tomorrow" = "Tomorrow",
  "Tomorrow Night" = "Tomorrow Night",
  "ClearSky" = "ClearSky",
  "Monotone" = "Monotone",
}

export interface IImageOptions {
  imgsize: { width: number; height: number };
  camera: ICameraPosition | ICameraEye | null;
  autocenter: boolean;
  viewall: boolean;
  view: "axes" | "crosshairs" | "edges" | "scales" | null;
  projection: "o" | "p" | null;
  colorscheme: ColorScheme | null;
  render: boolean | null;
  csglimit: number | null;
  preview: "throwntogether" | null;
}

export interface IAnimOptions extends IImageOptions {
  animate: number;
  animDelay: number;
  animate_sharding: { shard: number; num_shards: number } | null;
}

export interface IOption3mf {
  color_mode: "model" | "none" | "selected_only";
  unit: Unit;
  color: string;
  material_type: "color" | "basematerial";
  decimal_precision: precision;
  add_meta_data: "true" | "false";
  meta_data_title: string;
  meta_data_designer: string;
  meta_data_description: string;
  meta_data_copyright: string;
  meta_data_license_terms: string;
  meta_data_rating: string;
}

export enum precision {
  c1 = "1",
  c2 = "2",
  c3 = "3",
  c4 = "4",
  c5 = "5",
  c6 = "6",
  c7 = "7",
  c8 = "8",
  c9 = "9",
  c10 = "10",
  c11 = "11",
  c12 = "12",
  c13 = "13",
  c14 = "14",
  c15 = "15",
  c16 = "16",
}

export enum Unit {
  micron = "micron",
  millimeter = "millimeter",
  centimeter = "centimeter",
  meter = "meter",
  inch = "inch",
  foot = "foot",
}

export enum Export3dFormat {
  stl = "stl",
  asciiStl = "asciistl",
  binStl = "binstl",
  off = "off",
  wrl = "wrl",
  amf = "amf",
  "3mf" = "3mf",
  pov = "pov",
}

export enum Export2dFormat {
  dxf = "dxf",
  svg = "svg",
  pdf = "pdf",
  png = "png",
}

export enum ExportTextFormat {
  echo = "echo",
  ast = "ast",
  term = "term",
  nef3 = "nef3",
  nefdbg = "nefdbg",
  param = "param",
  summary = "summary",
  paramSet = "paramSet",
}

export type ExportFormat = Export3dFormat | Export2dFormat | ExportTextFormat;
