import { describe, expect, it } from "vitest";

import { createFctExecCommand, OpenScad } from "../../src/index.js";

const execOutput = createFctExecCommand(true, false);

describe("OpenScad", () => {
  it("construct", () => {
    const openScad = new OpenScad("", "", execOutput);
    expect(openScad).not.toBeNull();
  });
});
