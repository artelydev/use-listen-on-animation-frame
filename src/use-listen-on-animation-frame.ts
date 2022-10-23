import { useCallback, useEffect, useRef } from "react";
import {
  TrackedFn,
  ShouldInvokeListenersFn,
  RemoveAnimationFrameListener,
  AddAnimationFrameListener,
  UseListenOnAnimationFrameReturn,
} from "./types";
import { animationFrameListenersTree } from "./animation-frame-listeners-tree";
import { generateListenerId, generateListenerTreeId } from "./generate-id";

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
 * @param {ShouldInvokeListenersFn} shouldInvokeListenersFn - function returning bool determining if there is a need to invoke listeners. By default, listeners will only be executed if tracked function return has changed.
 * @return {UseListenOnAnimationFrameReturn} - [add, remove] tracked fn listeners
 */
export function useListenOnAnimationFrame<TrackedFnReturn>(
  trackedFn: TrackedFn<TrackedFnReturn>,
  shouldInvokeListenersFn?: ShouldInvokeListenersFn<TrackedFnReturn>
): UseListenOnAnimationFrameReturn<TrackedFnReturn> {
  const treeIdRef = useRef<string>(generateListenerTreeId());

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
      if (!animationFrameListenersTree[treeIdRef.current]) {
        throw new Error("Cannot set a listener on non-existent tree");
      }

      const listenerId = generateListenerId(treeIdRef.current);

      animationFrameListenersTree[treeIdRef.current].listeners[listenerId] =
        listener;

      return listenerId;
    }, []);

  const removeAnimationFrameListener: RemoveAnimationFrameListener =
    useCallback((listenerId) => {
      if (animationFrameListenersTree[treeIdRef.current]) {
        delete animationFrameListenersTree[treeIdRef.current].listeners[
          listenerId
        ];
      }
    }, []);

  return [addAnimationFrameListener, removeAnimationFrameListener];
}
