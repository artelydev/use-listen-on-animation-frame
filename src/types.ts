export type AnimationFrameListener<AnimationFrameListenerArg> = (
  /** Value of tracked function on this animation frame */
  value: AnimationFrameListenerArg,
  /** Value of tracked function on previous animation frame */
  previousValue?: AnimationFrameListenerArg
) => void;

export type TrackedFn<TrackedFnReturn> = () => TrackedFnReturn;

export type ShouldInvokeListenersFn<TrackedFnReturn> = (
  /** Value of tracked function on this animation frame  */
  nextValue: TrackedFnReturn,
  /** Value of tracked function on previous animation frame  */
  previousValue?: TrackedFnReturn
) => boolean;

export type AnimationFrameListenersSubtree<TrackedFnReturn> = {
  [listenerId: string]: AnimationFrameListener<TrackedFnReturn>;
};

export type AnimationFrameListenersTree<TrackedFnReturn> = {
  [treeId: string]: {
    shouldInvokeListeners: ShouldInvokeListenersFn<TrackedFnReturn>;
    trackedFn: TrackedFn<TrackedFnReturn>;
    listeners: AnimationFrameListenersSubtree<TrackedFnReturn>;
    previousValue?: TrackedFnReturn;
    running: boolean;
  };
};

export type AddAnimationFrameListener<AnimationFrameListenerArg> = (
  listener: AnimationFrameListener<AnimationFrameListenerArg>
) => string;

export type RemoveAnimationFrameListener = (listenerId: string) => void;

export type StopFn = () => void;
export type StartFn = () => void;

export type UseListenOnAnimationFrameOptions<TrackedFnReturn> = {
  /** Whether to start tracking when the hook is used. Once set, cannot be changed dynamically. */
  autoStart?: boolean;
  /** Whether to invoke listeners for function return on consequent animation frame  */
  shouldInvokeListeners?: ShouldInvokeListenersFn<TrackedFnReturn>;
};

export type UseListenOnAnimationFrameReturn<TrackedFnReturn> = [
  /** Add function return listener on consequent animation frame */
  addAnimationFrameListener: AddAnimationFrameListener<TrackedFnReturn>,
  removeAnimationFrameListener: RemoveAnimationFrameListener,
  /** Stops tracking, supplied function & listeners will not be invoked */
  stop: StopFn,
  /** (Re-)starts tracking & invoking listeners */
  start: StartFn
];
