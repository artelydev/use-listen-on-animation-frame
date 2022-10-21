import { useCallback, useEffect, useRef } from "react";
import {
  AnimationFrameListenersTree,
  TrackedFn,
  ShouldInvokeListenersFn,
  RemoveAnimationFrameListener,
  AddAnimationFrameListener,
  UseListenOnAnimationFrameReturn,
} from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const animationFrameListenersTree: AnimationFrameListenersTree<any> = {};

let animationFrameId: number;

let requestAnimationFrameLooping = false;

const startRequestAnimationFrameLoop = () => {
  if (Object.keys(animationFrameListenersTree).length === 0) {
    // No listeners - cancel loop
    window.cancelAnimationFrame(animationFrameId);
    requestAnimationFrameLooping = false;

    return;
  }

  animationFrameId = window.requestAnimationFrame(
    startRequestAnimationFrameLoop
  );

  Object.values(animationFrameListenersTree).forEach(
    ({ listeners, shouldInvokeListeners, trackedFn }) => {
      const trackedFnValue = trackedFn();

      if (!shouldInvokeListeners(trackedFnValue)) {
        return;
      }

      Object.values(listeners).forEach((listener) => {
        listener(trackedFnValue);
      });
    }
  );
};

/**
 * Hook that invokes a give function on every animation frame
 * And invokes existing listeners to it's return
 *
 * @export
 * @template TrackedFnReturn - return of a tracked function
 * @param {TrackedFn<TrackedFnReturn>} trackedFn - function to be listened to on every animation frame
 * @param {ShouldInvokeListenersFn} shouldInvokeListenersFn - function returning bool determining if there is a need to invoke listeners
 * @return {UseListenOnAnimationFrameReturn} - [add, remove] tracked fn listeners
 */
export function useListenOnAnimationFrame<TrackedFnReturn>(
  trackedFn: TrackedFn<TrackedFnReturn>,
  shouldInvokeListenersFn?: ShouldInvokeListenersFn<TrackedFnReturn>
): UseListenOnAnimationFrameReturn<TrackedFnReturn> {
  const treeIdRef = useRef<string>(
    Object.keys(animationFrameListenersTree).length.toString()
  );

  const previousValueRef = useRef<TrackedFnReturn>();

  useEffect(() => {
    const treeId = treeIdRef.current;

    // Initialize empty listeners subtree
    animationFrameListenersTree[treeId] = {
      listeners: {},
      trackedFn: () => null,
      shouldInvokeListeners: (nextValue: TrackedFnReturn) => {
        if (nextValue !== previousValueRef.current) {
          previousValueRef.current = nextValue;

          return true;
        }

        return false;
      },
    };

    if (!requestAnimationFrameLooping) {
      startRequestAnimationFrameLoop();

      requestAnimationFrameLooping = true;
    }

    return () => {
      // Destroy listeners subtree
      delete animationFrameListenersTree[treeId];
    };
  }, []);

  useEffect(() => {
    if (shouldInvokeListenersFn) {
      animationFrameListenersTree[treeIdRef.current].shouldInvokeListeners =
        shouldInvokeListenersFn;
    }
  }, [shouldInvokeListenersFn]);

  useEffect(() => {
    animationFrameListenersTree[treeIdRef.current].trackedFn = trackedFn;
  }, [trackedFn]);

  const addAnimationFrameListener: AddAnimationFrameListener<TrackedFnReturn> =
    useCallback((listener) => {
      const listenerId = Object.keys(
        animationFrameListenersTree[treeIdRef.current].listeners
      ).length.toString();

      animationFrameListenersTree[treeIdRef.current].listeners[listenerId] =
        listener;

      return listenerId;
    }, []);

  const removeAnimationFrameListener: RemoveAnimationFrameListener =
    useCallback((listenerId) => {
      delete animationFrameListenersTree[treeIdRef.current].listeners[
        listenerId
      ];
    }, []);

  return [addAnimationFrameListener, removeAnimationFrameListener];
}
