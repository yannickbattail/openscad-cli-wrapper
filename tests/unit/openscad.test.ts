import {execOutput, getOptions, OpenScad} from "../../src/index.js";

describe('OpenScad', () => {
  it('construct', () => {
    const openScad = new OpenScad("", getOptions(), execOutput);
    expect(openScad).not.toBeNull();
  });
});
