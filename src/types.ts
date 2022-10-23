export type AnimationFrameListener<AnimationFrameListenerArg> = (
  value: AnimationFrameListenerArg,
  previousValue?: AnimationFrameListenerArg
) => void;

export type TrackedFn<TrackedFnReturn> = () => TrackedFnReturn;

export type ShouldInvokeListenersFn<TrackedFnReturn> = (
  nextValue: TrackedFnReturn,
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
  };
};

export type AddAnimationFrameListener<AnimationFrameListenerArg> = (
  listener: AnimationFrameListener<AnimationFrameListenerArg>
) => string;

export type RemoveAnimationFrameListener = (listenerId: string) => void;

export type UseListenOnAnimationFrameReturn<TrackedFnReturn> = [
  addAnimationFrameListener: AddAnimationFrameListener<TrackedFnReturn>,
  removeAnimationFrameListener: RemoveAnimationFrameListener
];
