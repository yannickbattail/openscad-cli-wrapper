import { describe, expect, it } from "vitest";

import { execCommand, Export2dFormat, Export3dFormat, OpenScad } from "../../src/index.js";
import { getDefaultOpenscadOptions } from "./util/configuration.js";
import { before } from "node:test";
import { mkdirSync } from "fs";

const commands: string[] = [];

function createFctExecCommand(quietMode: boolean, showCommand = false): (command: string) => Promise<string> {
  return async (command: string): Promise<string> => {
    const fct =
      (await execCommand(
        command,
        {
          stdio: quietMode ? "pipe" : "stdout",
          allowFailure: false,
          quietMode: quietMode,
        },
        showCommand,
      )) ?? "";
    commands.push(command);
    return fct;
  };
}

const execOutput = createFctExecCommand(false, false);

function unrandomize(str: string): string {
  return str.replace(/json\.summary[0-9a-f]{10}\.json/g, "json\\.summaryXXXXXXXXXX\\.json");
}

describe("OpenScad", () => {
  before(() => {
    mkdirSync("./tests/unit/run/out");
  });
  it("construct", () => {
    const openScad = new OpenScad("", "", execOutput);
    expect(openScad).not.toBeNull();
  });

  it("generateModel 3mf", async () => {
    commands.length = 0;
    const openScad = new OpenScad("./tests/unit/run/test3d.scad", "./tests/unit/run/out", execOutput);
    await openScad.generateModel(
      { parameterFile: "./tests/unit/run/test3d.json", parameterName: "all_20" },
      Export3dFormat["3mf"],
      getDefaultOpenscadOptions(),
    );
    expect(unrandomize(commands[0])).toBe(
      unrandomize(
        `openscad --backend Manifold --enable import-function  --enable lazy-union  --enable predictible-output  --enable roof  --enable textmetrics  --enable object-function -O 'export-3mf/color-mode=model' -O 'export-3mf/color=' -O 'export-3mf/material-type=color' -O 'export-3mf/unit=millimeter' -O 'export-3mf/decimal-precision=6' -O 'export-3mf/add-meta-data=true' -O 'export-3mf/meta-data-copyright=me 2025' -O 'export-3mf/meta-data-description=__BASE_FILE_NAME__ - __PARAMETER_SET__ (made with OpenSCAD from "file __FILE_NAME__")' -O 'export-3mf/meta-data-designer=me' -O 'export-3mf/meta-data-license-terms=CC BY https://creativecommons.org/licenses/by/4.0/' -O 'export-3mf/meta-data-rating=' -O 'export-3mf/meta-data-title=__BASE_FILE_NAME__ - __PARAMETER_SET__' --summary all --summary-file ./tests/unit/run/test3d.json.summarya4e24c26fa.json -p ./tests/unit/run/test3d.json -P all_20 --export-format 3mf -o tests/unit/run/out/test3d_all_20.3mf ./tests/unit/run/test3d.scad`,
      ),
    );
  });

  it("generateModel stl", async () => {
    commands.length = 0;
    const openScad = new OpenScad("./tests/unit/run/test3d.scad", "./tests/unit/run/out", execOutput);
    await openScad.generateModel(
      { parameterFile: "./tests/unit/run/test3d.json", parameterName: "all_20" },
      Export3dFormat.stl,
      getDefaultOpenscadOptions(),
    );
    expect(unrandomize(commands[0])).toBe(
      unrandomize(
        `openscad --backend Manifold --enable import-function  --enable lazy-union  --enable predictible-output  --enable roof  --enable textmetrics  --enable object-function  --summary all --summary-file ./tests/unit/run/test3d.json\\.summaryXXXXXXXXXX\\.json -p ./tests/unit/run/test3d.json -P all_20 --export-format stl -o tests/unit/run/out/test3d_all_20.stl ./tests/unit/run/test3d.scad`,
      ),
    );
  });

  it("generate2d pdf", async () => {
    commands.length = 0;
    const openScad = new OpenScad("./tests/unit/run/test2d.scad", "./tests/unit/run/out", execOutput);
    await openScad.generate2d(
      { parameterFile: "./tests/unit/run/test2d.json", parameterName: "all_20" },
      Export2dFormat.pdf,
      getDefaultOpenscadOptions(),
    );
    expect(unrandomize(commands[0])).toBe(
      unrandomize(
        `openscad --backend Manifold --enable import-function  --enable lazy-union  --enable predictible-output  --enable roof  --enable textmetrics  --enable object-function -O 'export-pdf/paper-size=a4' -O 'export-pdf/orientation=portrait' -O 'export-pdf/show-filename=false' -O 'export-pdf/show-scale=true' -O 'export-pdf/show-scale-message=true' -O 'export-pdf/show-grid=false' -O 'export-pdf/grid-size=10' -O 'export-pdf/add-meta-data=true' -O 'export-pdf/meta-data-title=__BASE_FILE_NAME__ - __PARAMETER_SET__' -O 'export-pdf/meta-data-author=me' -O 'export-pdf/meta-data-subject=__BASE_FILE_NAME__ - __PARAMETER_SET__ (made with OpenSCAD from "file __FILE_NAME__")' -O 'export-pdf/meta-data-keywords=OpenSCAD, 2D model' -O 'export-pdf/fill=false' -O 'export-pdf/fill-color=black' -O 'export-pdf/stroke=true' -O 'export-pdf/stroke-color=black' -O 'export-pdf/stroke-width=0.35' --summary all --summary-file ./tests/unit/run/test2d.json\\.summaryXXXXXXXXXX\\.json -p ./tests/unit/run/test2d.json -P all_20 --export-format pdf -o tests/unit/run/out/test2d_all_20.pdf ./tests/unit/run/test2d.scad`,
      ),
    );
  });

  it("generate2d svg", async () => {
    commands.length = 0;
    const openScad = new OpenScad("./tests/unit/run/test2d.scad", "./tests/unit/run/out", execOutput);
    await openScad.generate2d(
      { parameterFile: "./tests/unit/run/test2d.json", parameterName: "all_20" },
      Export2dFormat.svg,
      getDefaultOpenscadOptions(),
    );
    expect(unrandomize(commands[0])).toBe(
      unrandomize(
        `openscad --backend Manifold --enable import-function  --enable lazy-union  --enable predictible-output  --enable roof  --enable textmetrics  --enable object-function -O 'export-svg/fill=false' -O 'export-svg/fill-color=white' -O 'export-svg/stroke=true' -O 'export-svg/stroke-color=black' -O 'export-svg/stroke-width=0.35' --summary all --summary-file ./tests/unit/run/test2d.json\\.summaryXXXXXXXXXX\\.json -p ./tests/unit/run/test2d.json -P all_20 --export-format svg -o tests/unit/run/out/test2d_all_20.svg ./tests/unit/run/test2d.scad`,
      ),
    );
  });
});
