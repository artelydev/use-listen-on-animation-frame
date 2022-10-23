import { generateListenerId, generateListenerTreeId } from "../generate-id";

import { animationFrameListenersTree } from "../animation-frame-listeners-tree";

const DUPLICATE_UUID = "1";
const UNIQUE_UUID = "2";

animationFrameListenersTree[DUPLICATE_UUID] = {
  shouldInvokeListeners: () => true,
  trackedFn: () => false,
  listeners: {
    [DUPLICATE_UUID]: () => {
      // do nothing
    },
  },
};

jest.mock("uuid", () => {
  let uuidInvocationNumber = 0;

  return {
    v4: () => {
      uuidInvocationNumber += 1;

      if (uuidInvocationNumber < 4) {
        return DUPLICATE_UUID;
      }

      uuidInvocationNumber = 0;

      return UNIQUE_UUID;
    },
  };
});

describe("generateListenerTreeId helper", () => {
  it("generates safely unique uuids", () => {
    expect(generateListenerTreeId()).toEqual(UNIQUE_UUID);
  });
});

describe("generateListenerId helper", () => {
  it("generates safely unique uuids", () => {
    expect(generateListenerId(DUPLICATE_UUID)).toEqual(UNIQUE_UUID);
  });
});
