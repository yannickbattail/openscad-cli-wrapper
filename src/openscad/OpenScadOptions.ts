export class ExperimentalFeatures {
  public roof: boolean = true;
  public input_driver_dbus: boolean = false;
  public lazy_union: boolean = true;
  public vertex_object_renderers_indexing: boolean = true;
  public textmetrics: boolean = true;
  public import_function: boolean = true;
  public predictible_output: boolean = true;
  public python_engine: boolean = false;

  constructor(cfg: object) {
    Object.assign(this, cfg);
  }

  public getExperimentalFeatures() {
    return (
      Object.entries(this)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([key, value]) => value)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(([key, value]) => ` --enable ${key.replaceAll("_", "-")}`)
        .join(" ")
    );
  }
}

export class OpenScadOptions {
  /**
   * path to OpenSCAD executable
   * openscad, openscad-nightly, xvfb-run openscad, xvfb-run openscad-nightly
   */
  public openScadExecutable: string = "openscad";
  /**
   * output directory for generated files
   */
  public outputDir: string = "./";
  /**
   * output directory for generated files
   */
  public suffix: string | null = null;
  /**
   * 3D rendering backend to use: 'CGAL' (old/slow) or 'Manifold' (new/fast)
   */
  public backend: "CGAL" | "Manifold" = "Manifold";
  /**
   * enable experimental features
   */
  public experimentalFeatures: ExperimentalFeatures = new ExperimentalFeatures({});
  /**
   * quiet mode (don't print anything *except* errors)
   */
  public quiet: boolean = false;
  /**
   * Stop on the first warning
   */
  public hardwarnings: boolean = false;
  /**
   * configure the parameter check for user modules and functions
   */
  public check_parameters: boolean = false;
  /**
   * configure the parameter range check for builtin modules
   */
  public check_parameter_ranges: boolean = false;
  /**
   * arg special debug info - specify 'all' or a set of source file names
   */
  public debug: string | null = null;
  /**
   * Trust python
   */
  public trust_python: boolean = false;
  /**
   * arg =module Call pip python module
   */
  public python_module: string | null = null;

  constructor(cfg: object) {
    Object.assign(this, cfg);
  }

  getOptions() {
    let opt = `--backend ${this.backend}`;
    opt += this.experimentalFeatures.getExperimentalFeatures();
    opt += this.quiet ? " --quiet" : "";
    opt += this.hardwarnings ? " --hardwarnings" : "";
    opt += this.check_parameters ? " --check-parameters" : "";
    opt += this.check_parameter_ranges ? " --check-parameter-ranges" : "";
    opt += this.debug ? ` --debug '${this.debug}'` : "";
    opt += this.trust_python ? " --trust-python" : "";
    opt += this.python_module ? ` --python-module '${this.python_module}'` : "";
    return opt;
  }
}

export class CameraPosition {
  public translate: { x: number; y: number; z: number } | undefined;
  public rotate: { x: number; y: number; z: number } | undefined;
  public dist: number | undefined;

  constructor(cfg: object) {
    Object.assign(this, cfg);
  }
}

export class CameraEye {
  public eye: { x: number; y: number; z: number } | undefined;
  public center: { x: number; y: number; z: number } | undefined;

  constructor(cfg: object) {
    Object.assign(this, cfg);
  }
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

export class ImageOptions {
  /**
   * width,height of exported png
   */
  public imgsize: { width: number; height: number } | null = null;
  /**
   * camera parameters when exporting png: =translate_x,y,z,rot_x,y,z,dist or =eye_x,y,z,center_x,y,z
   */
  public camera: CameraPosition | CameraEye | null = null;
  /**
   * adjust camera to look at object's center
   */
  public autocenter: boolean = false;
  /**
   * adjust camera to fit object
   */
  public viewall: boolean = false;
  /**
   * view options: axes | crosshairs | edges | scales
   */
  public view: "axes" | "crosshairs" | "edges" | "scales" | null = null;
  /**
   * ortho or perspective when exporting png
   */
  public projection: "o" | "p" | null = null;
  /**
   * colorscheme
   */
  public colorscheme: ColorScheme | null = null;
  /**
   * for full geometry evaluation when exporting png
   */
  public render: boolean | null = null;
  /**
   * stop rendering at n CSG elements when exporting png
   */
  public csglimit: number | null = null;
  /**
   * for ThrownTogether preview png
   */
  public preview: "throwntogether" | null = null;

  constructor(cfg: object) {
    Object.assign(this, cfg);
  }

  public getOptions() {
    let opt = " --export-format png";
    opt += this.imgsize ? ` --imgsize ${this.imgsize.width},${this.imgsize.height}` : "";
    if (this.camera) {
      if ("translate" in this.camera) {
        opt += ` --camera ${this.camera.translate?.x},${this.camera.translate?.y},${this.camera.translate?.z},${this.camera.rotate?.x},${this.camera.rotate?.y},${this.camera.rotate?.z},${this.camera.dist}`;
      } else {
        opt += ` --camera ${this.camera.eye?.x},${this.camera.eye?.y},${this.camera.eye?.z},${this.camera.center?.x},${this.camera.center?.y},${this.camera.center?.z}`;
      }
    }
    opt += this.autocenter ? " --autocenter" : "";
    opt += this.viewall ? " --viewall" : "";
    opt += this.view ? ` --view ${this.view}` : "";
    opt += this.projection ? ` --projection ${this.projection}` : "";
    opt += this.colorscheme ? ` --colorscheme ${this.colorscheme}` : "";
    opt += this.render ? " --render" : "";
    opt += this.csglimit ? ` --csglimit ${this.csglimit}` : "";
    opt += this.preview ? ` --preview ${this.preview}` : "";
    return opt;
  }
}

export class AnimOptions extends ImageOptions {
  /**
   * export N animated frames
   */
  public animate: number = 50;
  /**
   * export N animated frames
   */
  public animDelay: number = 100;
  /**
   * Parameter <shard>/<num_shards> - Divide work into <num_shards> and only output frames for <shard>. E.g. 2/5 only outputs the second 1/5 of frames. Use to parallelize work on multiple cores or machines.
   */
  public animate_sharding: { shard: number; num_shards: number } | null = null;

  constructor(cfg: object) {
    super(cfg);
    Object.assign(this, cfg);
  }

  public getOptions() {
    let opt = super.getOptions();
    opt += this.animate ? ` --animate ${this.animate}` : "";
    opt += this.animate_sharding
      ? ` --animate-sharding ${this.animate_sharding.shard}/${this.animate_sharding.num_shards}`
      : "";
    return opt;
  }
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

export class Option3mf {
  public color_mode: "model" | "none" | "selected_only" = "model";
  public unit: Unit = Unit.millimeter;
  public color: string = "";
  public material_type: "color" | "basematerial" = "basematerial";
  public decimal_precision: precision = precision.c6;
  public add_meta_data: "true" | "false" = "true";
  public meta_data_title: string = "";
  public meta_data_designer: string = "";
  public meta_data_description: string = "";
  public meta_data_copyright: string = "";
  public meta_data_license_terms: string = "";
  public meta_data_rating: string = "";

  constructor(cfg: object) {
    Object.assign(this, cfg);
  }

  public getOptions() {
    return Object.entries(this)
      .map(([key, value]) => `-O 'export-3mf/${key.replaceAll("_", "-")}=${value.replaceAll("'", "\\'")}'`)
      .join(" ");
  }
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
