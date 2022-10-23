import React, { useEffect, useRef } from "react";
import { render } from "@testing-library/react";
import { useListenOnAnimationFrame } from "../use-listen-on-animation-frame";

const ANIMATION_FRAME_WAIT_TIME = 1;

jest.useFakeTimers();

jest.spyOn(window, "requestAnimationFrame").mockImplementation((fn) => {
  return setTimeout(fn, ANIMATION_FRAME_WAIT_TIME);
});

jest.spyOn(window, "cancelAnimationFrame").mockImplementation((timeoutId) => {
  window.clearTimeout(timeoutId);
});

describe("useListenOnAnimationFrame hook", () => {
  let counter = 0;

  let listenerResult = 0;

  afterEach(() => {
    counter = 0;
    listenerResult = 0;
  });

  type TestComponentProps = {
    shouldRemoveListener?: boolean;
    shouldStop?: boolean;
    shouldRestart?: boolean;
    autoStart?: boolean;
    listenFn: () => number;
    listener: (newValue: number) => void;
  };

  const TestComponent: React.FC<TestComponentProps> = ({
    shouldRemoveListener,
    shouldStop,
    shouldRestart,
    autoStart = true,
    listenFn,
    listener,
  }) => {
    const [addListener, removeListener, stop, restart] =
      useListenOnAnimationFrame(listenFn, { autoStart });

    const listenerIdRef = useRef<string>();

    useEffect(() => {
      listenerIdRef.current = addListener(listener);

      return () => {
        removeListener(listenerIdRef.current as string);
      };
    }, [addListener, removeListener, listener]);

    useEffect(() => {
      if (shouldRemoveListener) {
        removeListener(listenerIdRef.current as string);
      }
    }, [shouldRemoveListener, removeListener]);

    useEffect(() => {
      if (shouldStop) {
        stop();
      }
    }, [shouldStop, stop]);

    useEffect(() => {
      if (shouldRestart) {
        restart();
      }
    }, [shouldRestart, restart]);

    return null;
  };

  describe("when tracking is stopped and started after some time", () => {
    const listenFn = () => {
      counter += 1;

      return counter;
    };

    const listener = (newCounter: number) => {
      listenerResult = newCounter * newCounter;
    };

    it("invokes tracked function only until its stopped and then after its started", () => {
      const { rerender } = render(
        <TestComponent listener={listener} listenFn={listenFn} />
      );

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);
      expect(listenerResult).toEqual(1);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(2);
      expect(listenerResult).toEqual(4);

      jest.advanceTimersByTime(3 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(5);
      expect(listenerResult).toEqual(25);

      rerender(
        <TestComponent shouldStop listener={listener} listenFn={listenFn} />
      );

      jest.advanceTimersByTime(25 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(5);

      expect(listenerResult).toEqual(25);

      rerender(
        <TestComponent shouldRestart listener={listener} listenFn={listenFn} />
      );

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(6);
      expect(listenerResult).toEqual(36);

      jest.advanceTimersByTime(2 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(8);
      expect(listenerResult).toEqual(64);
    });
  });

  describe("when autostart is false", () => {
    const listenFn = () => {
      counter += 1;

      return counter;
    };

    const listener = (newCounter: number) => {
      listenerResult = newCounter * newCounter;
    };

    it("doesn't start tracking when the hook is used, until its started", () => {
      const { rerender } = render(
        <TestComponent
          autoStart={false}
          listener={listener}
          listenFn={listenFn}
        />
      );

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(3 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      rerender(
        <TestComponent shouldRestart listener={listener} listenFn={listenFn} />
      );

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);
      expect(listenerResult).toEqual(1);

      jest.advanceTimersByTime(5 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(6);

      expect(listenerResult).toEqual(36);
    });
  });

  describe("when component is unmounted after some time", () => {
    const listenFn = () => {
      counter += 1;

      return counter;
    };

    const listener = (newCounter: number) => {
      listenerResult = newCounter * newCounter;
    };

    it("listens to a function return on every animation frame, but listen function and listeners are invoked only until component is unmounted", () => {
      const { unmount } = render(
        <TestComponent listener={listener} listenFn={listenFn} />
      );

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);
      expect(listenerResult).toEqual(1);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(2);
      expect(listenerResult).toEqual(4);

      jest.advanceTimersByTime(3 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(5);
      expect(listenerResult).toEqual(25);

      unmount();

      jest.advanceTimersByTime(25 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(5);

      expect(listenerResult).toEqual(25);
    });
  });

  describe("when listener is removed after some time", () => {
    const listenFn = () => {
      counter += 1;

      return counter;
    };

    const listener = (newCounter: number) => {
      listenerResult = newCounter * newCounter;
    };

    it("listens to a function return on every animation frame, but invokes listener only if it exists", () => {
      const { rerender } = render(
        <TestComponent listener={listener} listenFn={listenFn} />
      );

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);
      expect(listenerResult).toEqual(1);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(2);
      expect(listenerResult).toEqual(4);

      jest.advanceTimersByTime(3 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(5);
      expect(listenerResult).toEqual(25);

      rerender(
        <TestComponent
          listener={listener}
          listenFn={listenFn}
          shouldRemoveListener
        />
      );

      jest.advanceTimersByTime(25 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(30);

      expect(listenerResult).toEqual(25);
    });
  });

  describe("when listen function return changes on every animation frame", () => {
    const listenFn = () => {
      counter += 1;

      return counter;
    };

    const listener = (newCounter: number) => {
      listenerResult = newCounter * newCounter;
    };

    it("listens to a function return on every animation frame", () => {
      render(<TestComponent listener={listener} listenFn={listenFn} />);

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);
      expect(listenerResult).toEqual(1);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(2);
      expect(listenerResult).toEqual(4);

      jest.advanceTimersByTime(3 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(5);

      expect(listenerResult).toEqual(25);
    });
  });

  describe("when listen function return changes not on every animation frame", () => {
    const listenFn = () => {
      counter += 1;

      return Math.floor(counter / 2);
    };

    const listener = () => {
      listenerResult = counter * counter;
    };

    it("listens to a function return only on certain frames", () => {
      render(<TestComponent listener={listener} listenFn={listenFn} />);

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);
      expect(listenerResult).toEqual(1);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(2);
      expect(listenerResult).toEqual(4);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(3);
      expect(listenerResult).toEqual(4);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(4);
      expect(listenerResult).toEqual(16);

      jest.advanceTimersByTime(2 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(6);
      expect(listenerResult).toEqual(36);
    });
  });

  describe("when used without listeners", () => {
    const listenFn = () => {
      counter += 1;

      return counter;
    };

    const TestComponentWithoutListeners: React.FC = () => {
      useListenOnAnimationFrame(listenFn);

      return null;
    };

    it("behaves like a loop on animation frames", () => {
      render(<TestComponentWithoutListeners />);

      expect(counter).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);

      jest.advanceTimersByTime(9 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(10);
    });
  });

  describe("when custom shouldInvokeListeners function is supplied", () => {
    const listenFn = () => {
      counter += 1;

      return counter;
    };

    const shouldInvokeListeners = (
      nextValue: number,
      previousValue: number | undefined
    ) => {
      return nextValue === 3 && previousValue === 2;
    };

    const listener = (newCounter: number) => {
      listenerResult = newCounter * newCounter;
    };

    const TestComponentWithCustomShouldInvoke: React.FC = () => {
      const [addListener, removeListener] = useListenOnAnimationFrame(
        listenFn,
        {
          shouldInvokeListeners,
        }
      );

      useEffect(() => {
        const listenerId = addListener(listener);

        return () => {
          removeListener(listenerId);
        };
      }, [addListener, removeListener]);

      return null;
    };

    it("relies on shouldInvokeListeners when deciding whether to invoke listeners or not", () => {
      render(<TestComponentWithCustomShouldInvoke />);

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(2);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(3);

      expect(listenerResult).toEqual(9);

      jest.advanceTimersByTime(100 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(103);

      expect(listenerResult).toEqual(9);
    });
  });
});
