import React, { useEffect, useRef } from "react";
import { render } from "@testing-library/react";
import { animationFrameListenersTree } from "../animation-frame-listeners-tree";
import { useListenOnAnimationFrame } from "../use-listen-on-animation-frame";

const getTreeId = (treeNumber: number) => {
  return Object.keys(animationFrameListenersTree)[treeNumber];
};

const getListenerId = (treeNumber: number, listenerNumber: number) => {
  return Object.keys(
    animationFrameListenersTree[getTreeId(treeNumber)].listeners
  )[listenerNumber];
};

describe("animation frame listeners tree", () => {
  const listenFn = () => {
    return new Date();
  };

  it("contains no listeners tree when hook is not yet used", () => {
    expect(Object.keys(animationFrameListenersTree).length).toEqual(0);
  });

  describe("when hook is used once", () => {
    const listener = () => {
      // do nothing
    };

    type TestComponentProps = {
      shouldAddListener?: boolean;
      shouldRemoveListener?: boolean;
    };

    const TestComponent: React.FC<TestComponentProps> = ({
      shouldAddListener,
      shouldRemoveListener,
    }) => {
      const [addListener, removeListener] = useListenOnAnimationFrame(listenFn);

      const listenerIdRef = useRef<string>();

      useEffect(() => {
        if (shouldAddListener) {
          listenerIdRef.current = addListener(listener);
        }
      }, [addListener, shouldAddListener]);

      useEffect(() => {
        if (shouldRemoveListener) {
          removeListener(listenerIdRef.current as string);
        }
      }, [shouldRemoveListener, removeListener]);

      return null;
    };

    it("contains a single listener tree", () => {
      render(<TestComponent />);

      expect(Object.keys(animationFrameListenersTree).length).toEqual(1);
    });

    it("adds and removes a listener properly", () => {
      const { rerender } = render(<TestComponent />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn,
        running: true,
      });

      rerender(<TestComponent shouldAddListener />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener,
        },
        trackedFn: listenFn,
        running: true,
      });

      rerender(<TestComponent shouldRemoveListener />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn,
        running: true,
      });
    });

    it("destroys listener tree when component is unmounted", () => {
      const { unmount } = render(<TestComponent />);

      unmount();

      expect(Object.keys(animationFrameListenersTree).length).toEqual(0);
    });
  });

  describe("when hook is used multiple times", () => {
    const listenFn1 = () => {
      return new Date();
    };

    const listenFn2 = () => {
      return 1;
    };

    const listenFn3 = () => {
      return Math.random();
    };

    const listener1 = () => {
      // do nothing
    };
    const listener2 = () => {
      // do nothing
    };
    const listener3 = () => {
      // do nothing
    };

    type TestComponentProps = {
      addListenerNumber?: 1 | 2 | 3;
      removeListenerNumber?: 1 | 2 | 3;
    };

    const TestComponent: React.FC<TestComponentProps> = ({
      addListenerNumber,
      removeListenerNumber,
    }) => {
      const [addListener1, removeListener1] =
        useListenOnAnimationFrame(listenFn1);

      const [addListener2, removeListener2] =
        useListenOnAnimationFrame(listenFn2);

      const [addListener3, removeListener3] =
        useListenOnAnimationFrame(listenFn3);

      const listenerIdRef = useRef<[string?, string?, string?]>([]);

      useEffect(() => {
        if (addListenerNumber === 1) {
          listenerIdRef.current[0] = addListener1(listener1);
        }
      }, [addListener1, addListenerNumber]);

      useEffect(() => {
        if (removeListenerNumber === 1) {
          removeListener1(listenerIdRef.current[0] as string);
        }
      }, [removeListenerNumber, removeListener1]);

      useEffect(() => {
        if (addListenerNumber === 2) {
          listenerIdRef.current[1] = addListener2(listener2);
        }
      }, [addListener2, addListenerNumber]);

      useEffect(() => {
        if (removeListenerNumber === 2) {
          removeListener2(listenerIdRef.current[1] as string);
        }
      }, [removeListener2, removeListenerNumber]);

      useEffect(() => {
        if (addListenerNumber === 3) {
          listenerIdRef.current[2] = addListener3(listener3);
        }
      }, [addListener3, addListenerNumber]);

      useEffect(() => {
        if (removeListenerNumber === 3) {
          removeListener3(listenerIdRef.current[2] as string);
        }
      }, [removeListener3, removeListenerNumber]);

      return null;
    };

    it("contains multiple listener trees", () => {
      render(<TestComponent />);

      expect(Object.keys(animationFrameListenersTree).length).toEqual(3);
    });

    it("adds and removes listeners properly", () => {
      const { rerender } = render(<TestComponent />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn1,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn2,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(2)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn3,
        running: true,
      });

      rerender(<TestComponent addListenerNumber={1} />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener1,
        },
        trackedFn: listenFn1,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn2,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(2)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn3,
        running: true,
      });

      rerender(<TestComponent addListenerNumber={2} />);
      rerender(<TestComponent addListenerNumber={3} />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener1,
        },
        trackedFn: listenFn1,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(1, 0)]: listener2,
        },
        trackedFn: listenFn2,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(2)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(2, 0)]: listener3,
        },
        trackedFn: listenFn3,
        running: true,
      });

      rerender(<TestComponent removeListenerNumber={2} />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener1,
        },
        trackedFn: listenFn1,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn2,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(2)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(2, 0)]: listener3,
        },
        trackedFn: listenFn3,
        running: true,
      });

      rerender(<TestComponent removeListenerNumber={1} />);
      rerender(<TestComponent removeListenerNumber={3} />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn1,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn2,
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(2)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn3,
        running: true,
      });
    });

    it("destroys all the trees when component is unmounted", () => {
      const { unmount } = render(<TestComponent />);

      unmount();

      expect(Object.keys(animationFrameListenersTree).length).toEqual(0);
    });
  });

  describe("when hook is used in multiple components", () => {
    const listenFn1 = () => {
      return new Date();
    };

    const listenFn2 = () => {
      return Math.random();
    };

    const listener1 = () => {
      // do nothing
    };

    const listener2 = () => {
      // do nothing
    };

    type TestComponentProps = {
      shouldAddListener?: boolean;
      shouldRemoveListener?: boolean;
    };

    const TestComponent1: React.FC<TestComponentProps> = ({
      shouldAddListener,
      shouldRemoveListener,
    }) => {
      const [addListener, removeListener] =
        useListenOnAnimationFrame(listenFn1);

      const listenerIdRef = useRef<string>();

      useEffect(() => {
        if (shouldAddListener) {
          listenerIdRef.current = addListener(listener1);
        }
      }, [shouldAddListener, addListener]);

      useEffect(() => {
        if (shouldRemoveListener) {
          removeListener(listenerIdRef.current as string);
        }
      }, [shouldRemoveListener, removeListener]);

      return null;
    };

    const TestComponent2: React.FC<TestComponentProps> = ({
      shouldAddListener,
      shouldRemoveListener,
    }) => {
      const [addListener, removeListener] =
        useListenOnAnimationFrame(listenFn2);

      const listenerIdRef = useRef<string>();

      useEffect(() => {
        if (shouldAddListener) {
          listenerIdRef.current = addListener(listener2);
        }
      }, [shouldAddListener, addListener]);

      useEffect(() => {
        if (shouldRemoveListener) {
          removeListener(listenerIdRef.current as string);
        }
      }, [shouldRemoveListener, removeListener]);

      return null;
    };

    it("contains multiple listener trees", () => {
      render(
        <>
          <TestComponent1 />
          <TestComponent2 />
        </>
      );

      expect(Object.keys(animationFrameListenersTree).length).toEqual(2);
    });

    it("adds and removes listeners properly", () => {
      const { rerender } = render(
        <>
          <TestComponent1 />
          <TestComponent2 />
        </>
      );

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        trackedFn: listenFn1,
        listeners: {},
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        trackedFn: listenFn2,
        listeners: {},
        running: true,
      });

      rerender(
        <>
          <TestComponent1 />
          <TestComponent2 shouldAddListener />
        </>
      );

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        trackedFn: listenFn1,
        listeners: {},
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        trackedFn: listenFn2,
        listeners: {
          [getListenerId(1, 0)]: listener2,
        },
        running: true,
      });

      rerender(
        <>
          <TestComponent1 shouldAddListener />
          <TestComponent2 />
        </>
      );

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        trackedFn: listenFn1,
        listeners: {
          [getListenerId(0, 0)]: listener1,
        },
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        trackedFn: listenFn2,
        listeners: {
          [getListenerId(1, 0)]: listener2,
        },
        running: true,
      });

      rerender(
        <>
          <TestComponent1 shouldRemoveListener />
          <TestComponent2 shouldRemoveListener />
        </>
      );

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        trackedFn: listenFn1,
        listeners: {},
        running: true,
      });

      expect(animationFrameListenersTree[getTreeId(1)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        trackedFn: listenFn2,
        listeners: {},
        running: true,
      });
    });

    it("destroys all listener trees when unmounted", () => {
      const { unmount } = render(
        <>
          <TestComponent1 />
          <TestComponent2 />
        </>
      );

      unmount();

      expect(Object.keys(animationFrameListenersTree).length).toEqual(0);
    });
  });

  describe("when multiple listeners are added", () => {
    const listener1 = () => {
      // do nothing
    };

    const listener2 = () => {
      // do nothing
    };

    type TestComponentProps = {
      shouldAddListenerNumber?: 1 | 2;
      shouldRemoveListenerNumber?: 1 | 2;
    };

    const TestComponent: React.FC<TestComponentProps> = ({
      shouldAddListenerNumber,
      shouldRemoveListenerNumber,
    }) => {
      const [addListener, removeListener] = useListenOnAnimationFrame(listenFn);

      const listenerIdRef = useRef<[string?, string?]>([]);

      useEffect(() => {
        if (shouldAddListenerNumber === 1) {
          listenerIdRef.current[0] = addListener(listener1);
        }
      }, [addListener, shouldAddListenerNumber]);

      useEffect(() => {
        if (shouldAddListenerNumber === 2) {
          listenerIdRef.current[1] = addListener(listener2);
        }
      }, [addListener, shouldAddListenerNumber]);

      useEffect(() => {
        if (shouldRemoveListenerNumber === 1) {
          removeListener(listenerIdRef.current[0] as string);
        }
      }, [removeListener, shouldRemoveListenerNumber]);

      useEffect(() => {
        if (shouldRemoveListenerNumber === 2) {
          removeListener(listenerIdRef.current[1] as string);
        }
      }, [removeListener, shouldRemoveListenerNumber]);

      return null;
    };

    it("contains a single listeners tree", () => {
      render(<TestComponent />);

      expect(Object.keys(animationFrameListenersTree).length).toEqual(1);
    });

    it("adds and removes listeners properly", () => {
      const { rerender } = render(<TestComponent />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn,
        running: true,
      });

      rerender(<TestComponent shouldAddListenerNumber={1} />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener1,
        },
        trackedFn: listenFn,
        running: true,
      });

      rerender(<TestComponent shouldAddListenerNumber={2} />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener1,
          [getListenerId(0, 1)]: listener2,
        },
        trackedFn: listenFn,
        running: true,
      });

      rerender(<TestComponent shouldRemoveListenerNumber={1} />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener2,
        },
        trackedFn: listenFn,
        running: true,
      });

      rerender(<TestComponent shouldRemoveListenerNumber={2} />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {},
        trackedFn: listenFn,
        running: true,
      });
    });

    it("destroys listeners tree when unmounted", () => {
      const { unmount } = render(<TestComponent />);

      unmount();

      expect(Object.keys(animationFrameListenersTree).length).toEqual(0);
    });
  });

  describe("when tracking is stopped and started", () => {
    const listener = () => {
      // do nothing
    };

    type TestComponentProps = {
      shouldStop?: boolean;
      shouldStart?: boolean;
    };

    const TestComponent: React.FC<TestComponentProps> = ({
      shouldStop,
      shouldStart,
    }) => {
      const [addListener, removeListener, stop, start] =
        useListenOnAnimationFrame(listenFn);

      useEffect(() => {
        const listenerId = addListener(listener);

        return () => {
          removeListener(listenerId);
        };
      }, [addListener, removeListener]);

      useEffect(() => {
        if (shouldStop) {
          stop();
        }
      }, [shouldStop, stop]);

      useEffect(() => {
        if (shouldStart) {
          start();
        }
      }, [shouldStart, start]);

      return null;
    };

    it("sets running false", () => {
      const { rerender } = render(<TestComponent />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener,
        },
        trackedFn: listenFn,
        running: true,
      });

      rerender(<TestComponent shouldStop />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener,
        },
        trackedFn: listenFn,
        running: false,
      });

      rerender(<TestComponent shouldStart />);

      expect(animationFrameListenersTree[getTreeId(0)]).toEqual({
        shouldInvokeListeners: expect.any(Function),
        listeners: {
          [getListenerId(0, 0)]: listener,
        },
        trackedFn: listenFn,
        running: true,
      });
    });
  });
});
