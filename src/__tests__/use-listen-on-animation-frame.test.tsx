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

  const listener = (newCounter: number) => {
    listenerResult = newCounter * newCounter;
  };

  type TestComponentProps = {
    shouldRemoveListener?: boolean;
    listenFn: () => number;
  };

  const TestComponent: React.FC<TestComponentProps> = ({
    shouldRemoveListener,
    listenFn,
  }) => {
    const [addListener, removeListener] = useListenOnAnimationFrame(listenFn);

    const listenerIdRef = useRef<string>();

    useEffect(() => {
      listenerIdRef.current = addListener(listener);

      return () => {
        removeListener(listenerIdRef.current as string);
      };
    }, [addListener, removeListener]);

    useEffect(() => {
      if (shouldRemoveListener) {
        removeListener(listenerIdRef.current as string);
      }
    }, [shouldRemoveListener, removeListener]);

    return null;
  };

  describe("when component is unmounted after some time", () => {
    const listenFn = () => {
      counter += 1;

      return counter;
    };

    it("listens to a function return on every animation frame, but listen function and listeners are invoked only until component is unmounted", () => {
      const { unmount } = render(<TestComponent listenFn={listenFn} />);

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

    it("listens to a function return on every animation frame, but invokes listener only if it exists", () => {
      const { rerender } = render(<TestComponent listenFn={listenFn} />);

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

      rerender(<TestComponent listenFn={listenFn} shouldRemoveListener />);

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

    it("listens to a function return on every animation frame", () => {
      render(<TestComponent listenFn={listenFn} />);

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

    it("listens to a function return only on certain frames", () => {
      render(<TestComponent listenFn={listenFn} />);

      expect(counter).toEqual(0);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(1);
      expect(listenerResult).toEqual(0);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(2);
      expect(listenerResult).toEqual(1);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(3);
      expect(listenerResult).toEqual(1);

      jest.advanceTimersByTime(ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(4);
      expect(listenerResult).toEqual(4);

      jest.advanceTimersByTime(2 * ANIMATION_FRAME_WAIT_TIME);

      expect(counter).toEqual(6);
      expect(listenerResult).toEqual(9);
    });
  });
});
