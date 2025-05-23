import {OpenScad} from "../../src/openscad/OpenScad";
import {getOptions} from "../../src/openscad/OpenScadConfiguration";
import {execOutput} from "../../src/util/execBash";

describe('OpenScad', () => {
  it('construct', () => {
    const openScad = new OpenScad("", getOptions(), execOutput);
    expect(openScad).not.toBeNull();
  });
});
