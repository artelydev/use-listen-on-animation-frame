import { useCallback, useEffect, useRef } from "react";
import {
  TrackedFn,
  RemoveAnimationFrameListener,
  AddAnimationFrameListener,
  UseListenOnAnimationFrameReturn,
  StopFn,
  StartFn,
  UseListenOnAnimationFrameOptions,
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

  if (requestAnimationFrameLooping) {
    Object.entries(animationFrameListenersTree).forEach(
      ([
        treeId,
        { running, listeners, shouldInvokeListeners, trackedFn, previousValue },
      ]) => {
        if (!running) {
          return;
        }

        const trackedFnValue = trackedFn();

        if (!shouldInvokeListeners(trackedFnValue, previousValue)) {
          animationFrameListenersTree[treeId].previousValue = trackedFnValue;

          return;
        }

        Object.values(listeners).forEach((listener) => {
          listener(trackedFnValue, previousValue);
        });

        animationFrameListenersTree[treeId].previousValue = trackedFnValue;
      }
    );
  }
};

export const DEFAULT_USE_LISTEN_ON_ANIMATION_OPTIONS = {
  autoStart: true,
  shouldInvokeListeners: undefined,
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
  {
    shouldInvokeListeners = DEFAULT_USE_LISTEN_ON_ANIMATION_OPTIONS.shouldInvokeListeners,
    /** Whether to start tracking when using hook or not */
    autoStart = DEFAULT_USE_LISTEN_ON_ANIMATION_OPTIONS.autoStart,
  }: UseListenOnAnimationFrameOptions<TrackedFnReturn> = DEFAULT_USE_LISTEN_ON_ANIMATION_OPTIONS
): UseListenOnAnimationFrameReturn<TrackedFnReturn> {
  const treeIdRef = useRef<string>(generateListenerTreeId());

  const autoStartRef = useRef<boolean>(autoStart);

  useEffect(() => {
    const treeId = treeIdRef.current;

    // Initialize empty listeners subtree
    animationFrameListenersTree[treeId] = {
      listeners: {},
      trackedFn: () => null,
      running: autoStartRef.current,
      shouldInvokeListeners: (
        nextValue: TrackedFnReturn,
        previousValue?: TrackedFnReturn
      ) => nextValue !== previousValue,
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
    if (shouldInvokeListeners) {
      animationFrameListenersTree[treeIdRef.current].shouldInvokeListeners =
        shouldInvokeListeners;
    }
  }, [shouldInvokeListeners]);

  useEffect(() => {
    animationFrameListenersTree[treeIdRef.current].trackedFn = trackedFn;
  }, [trackedFn]);

  const addAnimationFrameListener: AddAnimationFrameListener<TrackedFnReturn> =
    useCallback((listener) => {
      if (!animationFrameListenersTree[treeIdRef.current]) {
        throw new Error(
          "Cannot set a listener on non-existent tree. Make sure that you hasn't stopped tracking"
        );
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

  const stop: StopFn = useCallback(() => {
    if (animationFrameListenersTree[treeIdRef.current]) {
      animationFrameListenersTree[treeIdRef.current].running = false;
    }
  }, []);

  const start: StartFn = useCallback(() => {
    if (animationFrameListenersTree[treeIdRef.current]) {
      animationFrameListenersTree[treeIdRef.current].running = true;
    }
  }, []);

  return [addAnimationFrameListener, removeAnimationFrameListener, stop, start];
}
