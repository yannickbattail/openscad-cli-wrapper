import { describe, expect, it } from "vitest";

import { createFctExecCommand, getOptions, OpenScad } from "../../src/index.js";

const execOutput = createFctExecCommand(true, false);

describe("OpenScad", () => {
  it("construct", () => {
    const openScad = new OpenScad("", getOptions(), execOutput);
    expect(openScad).not.toBeNull();
  });
});
