export type AnimationFrameListener<AnimationFrameListenerArg> = (
  arg: AnimationFrameListenerArg
) => void;

export type TrackedFn<TrackedFnReturn> = () => TrackedFnReturn;

export type ShouldInvokeListenersFn<TrackedFnReturn> = (
  nextReturn: TrackedFnReturn
) => boolean;

export type AnimationFrameListenersSubtree<TrackedFnReturn> = {
  [listenerId: string]: AnimationFrameListener<TrackedFnReturn>;
};

export type AnimationFrameListenersTree<TrackedFnReturn> = {
  [treeId: string]: {
    shouldInvokeListeners: ShouldInvokeListenersFn<TrackedFnReturn>;
    trackedFn: TrackedFn<TrackedFnReturn>;
    listeners: AnimationFrameListenersSubtree<TrackedFnReturn>;
  };
};

export type AddAnimationFrameListener<AnimationFrameListenerArg> = (
  listener: (trackedValue: AnimationFrameListenerArg) => void
) => string;

export type RemoveAnimationFrameListener = (listenerId: string) => void;

export type UseListenOnAnimationFrameReturn<TrackedFnReturn> = [
  addAnimationFrameListener: AddAnimationFrameListener<TrackedFnReturn>,
  removeAnimationFrameListener: RemoveAnimationFrameListener
];
