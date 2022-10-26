# Advanced usage

## Access previous animation frame function return

If you for some reason need previous animation frame return of your function - it is easily possible.

[Try it on codesandbox](https://codesandbox.io/s/ms-elapsed-from-1970-pwgpft)

```tsx
import React, { useEffect, useState } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const getMsElapsedFrom1970 = (previousFrameTimeElapsed?: number) => {
  if (previousFrameTimeElapsed) {
    console.log(
      "you wouldn't want to do it here but",
      previousFrameTimeElapsed
    );
  }

  return new Date().getTime();
};

const MilisecondsElapsedFrom1970: React.FC = () => {
  const [ms, setMs] = useState<number>(new Date().getTime());

  const [addListener] = useListenOnAnimationFrame(getMsElapsedFrom1970);

  useEffect(() => {
    addListener((_, previousFrameTimeElapsed) => {
      /**
       * Can be undefined, on the first call,
       * because there was no previous one
       */
      if (previousFrameTimeElapsed) {
        setMs(previousFrameTimeElapsed);
      }
    });
  }, [addListener]);

  return (
    <>
      <p>ms elapsed from 1970 on previous browser frame: {ms}</p>
    </>
  );
};
```

---

## Start and stop tracking your function

You can stop and start tracking again whenever you want.

[Try it on codesandbox](https://codesandbox.io/s/controllable-timer-292wmz)

<em>[Btw, compare the above performance with `setInterval`. You couldn't achieve same smoothness when event loop is busy](https://codesandbox.io/s/interval-vs-animation-frame-065es8)</em>

```tsx
import React, { useCallback, useEffect, useState } from "react";
import { useAnimationFrame } from "use-listen-on-animation-frame";

const formatDate = (date: Date) => {
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
};

export const ExtremelySmoothTimer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>(
    formatDate(new Date())
  );
  const [isTicking, setIsTicking] = useState(true);

  const syncDate = useCallback(() => {
    setCurrentTime(formatDate(new Date()));
  }, []);

  const [stop, start] = useAnimationFrame(syncDate, {
    /**
     * optionally indicate that the getDate function and
     * listeners should not be invoked until you `start()`
     */
    autoStart: false,
  });

  useEffect(() => {
    if (isTicking) {
      /* start tracking getDate & listeners */
      start();
    } else {
      /* stop tracking getDate & listeners */
      stop();
    }
  }, [isTicking, start, stop]);

  return (
    <>
      <div>Smooth timer: {currentTime}</div>
      <div>
        {!isTicking && (
          <button
            onClick={() => {
              setIsTicking(true);
            }}
          >
            Start timer
          </button>
        )}
        {isTicking && (
          <button
            onClick={() => {
              setIsTicking(false);
            }}
          >
            Stop timer
          </button>
        )}
      </div>
    </>
  );
};
```

---

## Optimize/Unoptimize your listeners

By default, if you don't provide [`shouldInvokeListeners` option](#optionsshouldinvokelisteners) - listeners will be invoked only if tracked function return changes. It means that a supplied function will still be invoked on every animation frame, but listeners will not.

[Try it on codesandbox](https://codesandbox.io/s/player-timer-heavy-load-yqz79q)

```tsx
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const conditionallyInvokeListeners = (
  nextValue: number,
  _previousValue: number /* previous animation frame value */
) => {
  /* defaults to return nextValue !== previousValue */

  /**
   * invoke only if current animation
   * frame current time is bigger than 2
   * second AND lesser than 3 seconds
   */
  return nextValue > 2 && nextValue < 3;
};

const alwaysInvokeListeners = () => {
  /**
   * usually you shouldn't do this, as we try to cut
   * performance costs, we don't want to invoke a bunch
   * of functions even if tracked function return hasn't changed
   *
   * Listeners will be invoked even if player current time hasn't changed
   */
  return true;
};

const VideoWithCurrentTime: React.FC = () => {
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* better memoized */
  const getVideoTime = useCallback(() => {
    if (videoRef.current) {
      return videoRef.current.currentTime;
    }
  }, []);

  const [addOptimizedListener] = useListenOnAnimationFrame(getVideoTime, {
    shouldInvokeListeners: conditionallyInvokeListeners,
  });

  const [addNotOptimizedListener] = useListenOnAnimationFrame(getVideoTime, {
    shouldInvokeListeners: alwaysInvokeListeners,
  });

  useEffect(() => {
    addNotOptimizedListener((currentTime) => {
      setVideoCurrentTime(currentTime ?? 0);
    });
  }, [addNotOptimizedListener]);

  useEffect(() => {
    addOptimizedListener(() => {
      /**
       * does something heavy only when video current time
       * is between 2 and 3 seconds
       */
      for (let i = 0; i < 1000; i++) {
        console.log(":)");
      }

      console.clear();
    });
  }, [addOptimizedListener]);

  return (
    <>
      <h1>Player with timer & heavy load between 2 and 3s</h1>
      <video
        controls
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        ref={videoRef}
      />
      <p>Video time is: {videoCurrentTime}</p>
    </>
  );
};
```
