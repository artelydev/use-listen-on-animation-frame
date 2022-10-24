<h2 align="center">useListenOnAnimationFrame</h2>

<p align="center">
  Invoke & track your functions on every animation frame
  <br />
  <em>
    ESM
    · CommonJS
    · 1 dependency
  </em>
</p>

<p align="center">
  <a href="https://github.com/artelydev/use-listen-on-animation-frame/actions?query=workflow%3AMain+branch%3Amain">
    <img alt="Github Actions Build Status" src="https://img.shields.io/github/workflow/status/artelydev/use-listen-on-animation-frame/Main?label=Build&style=flat-square"></img></a>    
  <a href="https://www.npmjs.com/package/use-listen-on-animation-frame">
    <img alt="npm version" src="https://img.shields.io/npm/v/use-listen-on-animation-frame.svg?style=flat-square"></img></a>
  <a href="https://github.com/prettier/prettier">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"></img></a>
  <a href="https://github.com/artelydev/use-listen-on-animation-frame/blob/main/LICENSE">
    <img alt="license: MIT" src="https://img.shields.io/github/license/artelydev/use-listen-on-animation-frame">
    </img>
  </a>
</p>

## :book: Usage

### Invoke your function on every animation frame

`setInterval` frequent yet performant alternative

#### Animation frame counter

[Try it on codesandbox](https://codesandbox.io/s/animation-frame-counter-00pfwo)

```typescript
import React, { useCallback, useState } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const AnimationFrameCounter: React.FC = () => {
  const [animationFramesCounter, setAnimationFramesCounter] = useState(0);

  /* better memoized */
  const handleNewAnimationFrame = useCallback(() => {
    setAnimationFramesCounter((prev) => prev + 1);
  }, []);

  useListenOnAnimationFrame(handleNewAnimationFrame);

  return <div>Browser animation frames painted: {animationFramesCounter}</div>;
};
```

#### Video & timer

[Try it on codesandbox](https://codesandbox.io/s/player-current-time-g6zqgl)

```typescript
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const VideoWithCurrentTime: React.FC = () => {
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [timeupdateCurrentTime, setTimeupdateCurrentTime] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const setVideoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    const onTimeupdate = () => {
      setTimeupdateCurrentTime(videoRef.current!.currentTime);
    };

    if (videoElement) {
      videoRef.current = videoElement;

      videoElement.addEventListener("timeupdate", onTimeupdate);
    } else {
      videoRef.current?.removeEventListener("timeupdate", onTimeupdate);
      videoRef.current = null;
    }
  }, []);

  /* better memoized */
  const getVideoTime = useCallback(() => {
    if (videoRef.current) {
      return videoRef.current.currentTime;
    }
  }, []);

  const [addListener, removeListener] = useListenOnAnimationFrame(getVideoTime);

  useEffect(() => {
    const listenerId = addListener((currentTime) => {
      setVideoCurrentTime(currentTime);
    });

    return () => {
      removeListener(listenerId);
    };
  }, [addListener, removeListener]);

  return (
    <>
      <h1>Player with timers</h1>
      <video
        controls
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        ref={setVideoRef}
      />
      <p>
        Actual video time is:{" "}
        <span style={{ color: "green" }}>{videoCurrentTime}</span>
      </p>
      <p>
        What HTML5 Video timeupdate reports:{" "}
        <span style={{ color: "red" }}>{timeupdateCurrentTime}</span>
      </p>

      <h3>How would you build your UI with that?</h3>
    </>
  );
};
```

### Track your function return on every animation frame

If you need to track your function return on every animation frame and do something with it - go for it!

[Try it on codesandbox](https://codesandbox.io/s/evening-hours-indicator-pwp3wv)

```typescript
import "./styles.css";

import React, { useCallback, useEffect, useState } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const EveningHoursIndicator: React.FC = () => {
  const [reached8PM, setReached8PM] = useState<boolean>(false);
  const [reached9PM, setReached9PM] = useState<boolean>(false);

  /**
   * It's better, but not a must, when memoized inside
   * with useCallback, or defined outside of a component
   */
  const getHours = useCallback(() => {
    /**
     * by default, listeners are only
     * invoked if return value of tracked
     * function has changed between frames
     */
    return new Date().getHours();
  }, []);

  const [addListener, removeListener] = useListenOnAnimationFrame(getHours);

  useEffect(() => {
    const pm8Listener = addListener((nextHours) => {
      if (nextHours > 20) {
        console.log("its later than 8 PM");

        setReached8PM(true);
      }
    });

    const pm9Listener = addListener((nextHours) => {
      if (nextHours > 21) {
        console.log("its later than 9 PM");

        setReached9PM(true);
      }
    });

    return () => {
      removeListener(pm8Listener);
      removeListener(pm9Listener);
    };
  }, [addListener, removeListener]);

  return (
    <>
      <p>{reached8PM ? "its finally 8 PM" : "its not yet 8 PM"}</p>
      <p>{reached9PM ? "its finally 9 PM" : "its not yet 9 PM"}</p>
    </>
  );
};
```

## :gear: Advanced usage

### Access previous animation frame function return

If you for some reason need previous animation frame return of your function - it is easily possible.

[Try it on codesandbox](https://codesandbox.io/s/ms-elapsed-from-1970-pwgpft)

```typescript
import React, { useEffect, useState } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const getMsElapsedFrom1970 = () => {
  return new Date().getTime();
};

const MilisecondsElapsedFrom1970: React.FC = () => {
  const [ms, setMs] = useState<number>(new Date().getTime());

  const [addListener, removeListener] =
    useListenOnAnimationFrame(getMsElapsedFrom1970);

  useEffect(() => {
    const previousFrameListenerId = addListener(
      (_, previousFrameTimeElapsed) => {
        /**
         * Can be undefined, on the first call,
         * because there was no previous one
         */
        if (previousFrameTimeElapsed) {
          setMs(previousFrameTimeElapsed);
        }
      }
    );

    return () => {
      removeListener(previousFrameListenerId);
    };
  }, [addListener, removeListener]);

  return (
    <>
      <p>ms elapsed from 1970 on previous browser frame: {ms}</p>
    </>
  );
};
```

### Start and stop tracking your function

You can stop and start tracking again whenever you want.

[Try it on codesandbox](https://codesandbox.io/s/controllable-timer-292wmz)

<em>[Btw, compare the above performance with `setInterval`. You couldn't achieve same smoothness when event loop is busy](https://codesandbox.io/s/interval-vs-animation-frame-065es8)</em>

```typescript
import React, { useEffect, useState } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const formatDate = (date: Date) => {
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
};

const getDate = () => {
  return new Date();
};

export const ExtremelySmoothTimer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>(
    formatDate(new Date())
  );
  const [isTicking, setIsTicking] = useState(true);

  const [addListener, removeListener, stop, start] = useListenOnAnimationFrame(
    getDate,
    {
      /**
       * optionally indicate that the getDate function and
       * listeners should not be invoked until you `start()`
       */
      autoStart: false,
    }
  );

  useEffect(() => {
    const listenerId = addListener((date) => {
      setCurrentTime(formatDate(date));
    });

    return () => {
      removeListener(listenerId);
    };
  }, [addListener, removeListener]);

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

### Optimize/Unoptimize your listeners

By default, if you don't provide `shouldInvokeListeners` option - listeners will be invoked only if tracked function return changes. It means that a supplied function will still be invoked on every animation frame, but listeners will not.

[Try it on codesandbox](https://codesandbox.io/s/player-timer-heavy-load-yqz79q)

```typescript
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

  const [addOptimizedListener, removeOptimizedListener] =
    useListenOnAnimationFrame(getVideoTime, {
      shouldInvokeListeners: conditionallyInvokeListeners,
    });

  const [addNotOptimizedListener, removeNotOptimizedListener] =
    useListenOnAnimationFrame(getVideoTime, {
      shouldInvokeListeners: alwaysInvokeListeners,
    });

  useEffect(() => {
    const notOptimizedListenerId = addNotOptimizedListener((currentTime) => {
      setVideoCurrentTime(currentTime);
    });

    return () => {
      removeNotOptimizedListener(notOptimizedListenerId);
    };
  }, [addNotOptimizedListener, removeNotOptimizedListener]);

  useEffect(() => {
    const optimizedListenerId = addOptimizedListener(() => {
      /**
       * does something heavy only when video current time
       * is between 1 and 2 seconds
       */
      for (let i = 0; i < 1000; i++) {
        console.log(":)");
      }

      console.clear();
    });

    return () => {
      removeOptimizedListener(optimizedListenerId);
    };
  }, [addOptimizedListener, removeOptimizedListener]);

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

## :exclamation: Q&A

- ### Why would you even consider using animation frames?

  For animations! <b>But it's not the only case</b>.

  You can use it as a better replacement for frequent `setInterval`.

  What if I told you that e.g. [`timeupdate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event) of HTML5 video could be fired 4 times per second?

  And you're building your own video editor and want to animate your custom timeline? Would you move the playhead or current time in your video editor 4 times per second? I believe you would want the smoothest transition you can do.

  Then what about `setInterval` and check the video current time? That's possible, but how you would determine the frequency? 30Hz? 50Hz? 200Hz? That's a performance implication question already. Also if you would do any animations - high-frequency `setInterval` will flicker & shear your DOM.

  Also `setInterval` [is](https://blog.bitsrc.io/how-to-get-an-accurate-setinterval-in-javascript-ca7623d1d26a). [known](https://thecodersblog.com/increase-javascript-timoeout-accuracy). [for](https://www.reddit.com/r/learnjavascript/comments/3aqtzf/issue_with_setinterval_function_losing_accuracy/). [it's](https://github.com/dbkaplun/driftless). [inconsistency](https://abhi9bakshi.medium.com/why-javascript-timer-is-unreliable-and-how-can-you-fix-it-9ff5e6d34ee0).

  Wouldn't it be better to rely on the browser repaint frequency? Especially handy when you want to do animations because it's invoked [before the repaint](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)!

- ### When you should use this package?

  If you need to invoke/listen to a function at extreme frequency mutating DOM, animating something, and you want to ensure the smoothness and consistency of what you do.

  Or if you need a `setInterval` with less than `50ms` and you want it to be somewhat consistent.

- ### When you should **not** use this package?

  If you don't need to invoke/listen to a function at extreme frequency.

  <b>Ask yourself, is there any other way?</b>
