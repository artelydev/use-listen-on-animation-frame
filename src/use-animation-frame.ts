import { TrackedFn, UseListenOnAnimationFrameOptions } from "./types";
import {
  DEFAULT_USE_LISTEN_ON_ANIMATION_OPTIONS,
  useListenOnAnimationFrame,
} from "./use-listen-on-animation-frame";

export function useAnimationFrame<TrackedFnReturn>(
  trackedFn: TrackedFn<TrackedFnReturn>,
  {
    autoStart = DEFAULT_USE_LISTEN_ON_ANIMATION_OPTIONS.autoStart,
  }: Pick<UseListenOnAnimationFrameOptions<TrackedFnReturn>, "autoStart">
) {
  const [, , stop, start] = useListenOnAnimationFrame(trackedFn, {
    autoStart,
  });

  return [stop, start];
}
