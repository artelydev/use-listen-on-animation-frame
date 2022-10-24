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
  <a href="https://github.com/artelydev/use-listen-on-animation-frame/blob/main/LICENSE">
    <img alt="license: MIT" src="https://img.shields.io/github/license/artelydev/use-listen-on-animation-frame">
    </img>
  </a>
  <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/use-listen-on-animation-frame"></img>
  <img alt="typed" src="https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square">
</p>

<h1>Table of Contents</h1>

- [:vs: Why this library?](#vs-why-this-library)
- [:green_book: Installation](#green_book-installation)
- [:blue_book: Usage](#blue_book-usage)
- [:orange_book: API](#orange_book-api)
  - [`useAnimationFrame`](#useanimationframe)
    - [Arguments](#arguments)
    - [Returns](#returns)
    - [Note](#note)
  - [`useListenOnAnimationFrame`](#uselistenonanimationframe)
    - [Arguments](#arguments-1)
    - [Returns](#returns-1)
  - [When to use `useListenOnAnimationFrame` over `useAnimationFrame`](#when-to-use-uselistenonanimationframe-over-useanimationframe)
- [:gear: Advanced usage](#gear-advanced-usage)
  - [Access previous animation frame function return](#access-previous-animation-frame-function-return)
  - [Start and stop tracking your function](#start-and-stop-tracking-your-function)
  - [Optimize/Unoptimize your listeners](#optimizeunoptimize-your-listeners)
- [:exclamation: Q&A](#exclamation-qa)

  - [Why would you even consider using animation frames?](#why-would-you-even-consider-using-animation-frames)
  - [When you should use this package?](#when-you-should-use-this-package)
  - [When you should **not** use this package?](#when-you-should-not-use-this-package)

  <hr />

## :vs: Why this library?

| Features                                             | `useListenOnAnimationFrame`                                                                                                                                                                               | `setInterval`                                                     | `requestAnimationFrame`   | `other animation frame libraries`                                          |
| :--------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| suitable for frequent DOM mutations                  | **yes**                                                                                                                                                                                                   | no                                                                | yes                       | commonly yes                                                               |
| single animation frame loop                          | **yes**, for whole application                                                                                                                                                                            | not applicable                                                    | not by default            | **no**, common to have multiple frame loops                                |
| performant & consistent                              | [**yes**](https://codesandbox.io/s/interval-vs-animation-frame-065es8)                                                                                                                                    | [no](https://codesandbox.io/s/interval-vs-animation-frame-065es8) | depends on implementation | depends on implementation                                                  |
| side effects                                         | [**yes**](#addlistener) and [**yes**](#when-to-use-uselistenonanimationframe-over-useanimationframe)                                                                                                      | no                                                                | no                        | **no**, commonly not                                                       |
| extensively controllable (start/stop & side effects) | [**yes**](#start-and-stop-tracking-your-function) and [**yes**](#stop) and [**yes**](#start), and even for side effects with multiple options [[1]](#removelistener) [[2]](#optionsshouldinvokelisteners) | no                                                                | no                        | **no**, commonly not                                                       |
| autoclean (start/stop/unmount)                       | **yes**, it even automatically stops and starts request animation frame loop only when needed                                                                                                             | no                                                                | no                        | **commonly not fully**, it keeps animation frame loop even when not needed |
| configurable                                         | **yes!** [[1]](#optionsautostart) [[2]](#optionsshouldinvokelisteners) [[3]](#optimizeunoptimize-your-listeners)                                                                                          | no                                                                | no                        | **commonly not**                                                           |
| accessing previous return value                      | [**yes, even for side effects**](#access-previous-animation-frame-function-return)                                                                                                                        | no                                                                | no                        | **commonly not**                                                           |

## :green_book: Installation

```bash
  $ npm i use-listen-on-animation-frame
```

## :blue_book: Usage

### Do something on animation frames

[Try it on codesandbox](https://codesandbox.io/s/console-date-on-animation-frame-z7xof4)

<details open>
  <summary><b>Source code</b></summary>

```typescript
import React, { useEffect } from "react";
import { useAnimationFrame } from "use-listen-on-animation-frame";

const fn = () => {
  console.log(new Date());
};

const ConsoleDateComponent: React.FC = () => {
  const [stop] = useAnimationFrame(fn); // starts logging date on every animation frame

  useEffect(() => {
    const timeoutId = setTimeout(stop, 5000); // stops logging after 5 seconds

    return () => {
      clearTimeout(timeoutId);
    };
  }, [stop]);

  return null;
};
```

</details>

#### Animation frame counter

[Try it on codesandbox](https://codesandbox.io/s/animation-frame-counter-00pfwo)

<details>
  <summary><b>Source code</b></summary>

```typescript
import React, { useCallback, useState } from "react";
import { useAnimationFrame } from "use-listen-on-animation-frame";

const AnimationFrameCounter: React.FC = () => {
  const [animationFramesCounter, setAnimationFramesCounter] = useState(0);

  /* better memoized */
  const handleNewAnimationFrame = useCallback(() => {
    setAnimationFramesCounter((prev) => prev + 1);
  }, []);

  useAnimationFrame(handleNewAnimationFrame);

  return <div>Browser animation frames painted: {animationFramesCounter}</div>;
};
```

</details>

#### Video & current timer

[Try it on codesandbox](https://codesandbox.io/s/player-current-time-3yy31o)

[Btw, compare it to relying on `timeupdate` event](https://codesandbox.io/s/hooks-vs-timeupdate-g6zqgl)

<details>
  <summary><b>Source code</b></summary>

```typescript
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const VideoWithCurrentTime: React.FC = () => {
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  /* better memoized */
  const getVideoTime = useCallback(() => {
    if (videoRef.current) {
      return videoRef.current.currentTime;
    }
  }, []);

  const [addListener] = useListenOnAnimationFrame(getVideoTime);

  useEffect(() => {
    const listenerId = addListener((currentTime) => {
      setVideoCurrentTime(currentTime);
    });
  }, [addListener]);

  return (
    <>
      <h1>Player with current timer</h1>
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

</details>

### Track your function return on every animation frame

If you need to track your function return on every animation frame and do something with it - go for it!

[Try it on codesandbox](https://codesandbox.io/s/evening-hours-indicator-pwp3wv)

<details>
  <summary><b>Source code</b></summary>

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

  const [addListener] = useListenOnAnimationFrame(getHours);

  useEffect(() => {
    addListener((nextHours) => {
      if (nextHours > 20) {
        console.log("its later than 8 PM");

        setReached8PM(true);
      }
    });

    addListener((nextHours) => {
      if (nextHours > 21) {
        console.log("its later than 9 PM");

        setReached9PM(true);
      }
    });
  }, [addListener]);

  return (
    <>
      <p>{reached8PM ? "its finally 8 PM" : "its not yet 8 PM"}</p>
      <p>{reached9PM ? "its finally 9 PM" : "its not yet 9 PM"}</p>
    </>
  );
};
```

</details>

## :orange_book: API

Library provides 2 hooks which are `useAnimationFrame`, `useListenOnAnimationFrame`.

### `useAnimationFrame`

Starts invoking supplied function on every animation frame.

#### Arguments

##### `fn`

First argument `fn` - a function to be invoked on every animation frame.

**It's better for this `fn` to be memoized either with `useCallback` or to be defined outside of your component if that still fits your needs**

`fn` might accept a single argument of previous invocation return like in the example:

<details open>
  <summary><b>Example</b></summary>

```typescript
import { useAnimationFrame } from "use-listen-on-animation-frame";

const fn = useCallback((previousFnReturn) => {
  console.log("previouslyReturned", previousFnReturn); // undefined if no previous call yet

  const fnReturn = new Date();

  console.log("now returning", fnReturn);

  return fnReturn;
}, []);

useAnimationFrame(fn);
```

</details>

##### `options`

###### `options.autoStart`

Boolean indicator whether to start invoking function immediately when the hook is used or not. **Defaults** to `true`.

<details>
  <summary><b>Example</b></summary>

```typescript
const [_stop, start] = useAnimationFrame(fn, {
  autoStart: false,
});

useEffect(() => {
  if (somethingIsGood) {
    start();
  }
}, [start]);
```

</details>

#### Returns

Returns `[stop, start]` functions.

##### `[stop]`

Function to stop the function from being invoked on every animation frame, and if that was the last function in application still running on animation frame - will effectively `cancelRequestAnimationFrame`.

**You can be assured in it's static reference - no changes between renders, same function**.

<details>
  <summary><b>Example</b></summary>

<!-- prettier-ignore-start -->
```typescript
const [stop] = useAnimationFrame(fn);

useEffect(() => {
  if (somethingIsWrong) {
    stop();
  }
}, [stop]);

```
<!-- prettier-ignore-end -->

</details>

##### `[ , start]`

Function to start the function invocations on every animation frame, and if it's the first function in application to be run on animation frame - starts a single animation frame loop.

**You can be assured in it's static reference - no changes between renders, same function**

<details>
  <summary><b>Example</b></summary>

```typescript
const [stop, start] = useAnimationFrame(fn);

useEffect(() => {
  if (somethingIsWrong) {
    stop();
  }
}, [stop]);

useEffect(() => {
  if (somethingIsGoodAgain) {
    start();
  }
}, [start]);
```

</details>

#### Note

`useAnimationFrame` is a handy alias for.

```typescript
const [_add, _remove, stop, start] = useListenOnAnimationFrame(fn, {
  autostart,
});

return [stop, start];
```

### `useListenOnAnimationFrame`

#### Arguments

##### `fn`

[See `useAnimationFrame` `fn`](#fn)

##### `options`

Optional second argument `options`

###### `options.autoStart`

[See `useAnimationFrame` `autoStart`](#optionsautostart)

###### `options.shouldInvokeListeners`

Function that accepts 2 arguments `thisFrameReturn` and `previousFrameReturn` and determines if listeners should be invoked on this frame or not.

`previousFrameReturn` can be `undefined` if there was no previous frame return yet.

**It's better for this function to be memoized with `useCallback` or defined outside of your component if it still fits your needs**

<details>
  <summary><b>Example</b></summary>

```typescript
const shouldInvokeListeners = useCallback(
  (thisFrameReturn, previousFrameReturn) => {
    /** invoke listeners only if this frame return is bigger than 5 or previous frame return is bigger than 3 */
    return thisFrameReturn > 5 || previousFrameReturn < 3;
  },
  []
);

const [addFrameListener] = useListenOnAnimationFrame(fn, {
  shouldInvokeListeners,
});
```

</details>

#### Returns

Returns `[addListener, removeListener, stop, start]`;

##### `[addListener]`

Function that accepts your `listener` function.
`listener` in turn accepts 2 arguments `thisFrameReturn` and `previousFrameReturn`.

**Returns** `listenerId: string`, unique uuid of your listener, if you need to remove it later.

**You can be assured in it's static reference - no changes between renders, same function**

<details>
  <summary><b>Example</b></summary>

```typescript
const fn = useCallback(() => {
  return new Date().getTime();
}, []);

const [addListener] = useListenOnAnimationFrame(fn);

useEffect(() => {
  addListener((thisFrameReturn, previousFrameReturn) => {
    console.log("this frame returned", thisFrameReturn);

    // possibly undefined if no previous call yet
    if (previousFrameReturn !== undefined) {
      console.log("previous frame returned", previousFrameReturn);
    }

    // do anything
  });
}, [addListener]);
```

</details>

##### `[ , removeListener]`

Function that accepts `listenerId: string` unique uuid from [`[addListener]`](#addlistener) and removes a listener.

**You can be assured in it's static reference - no changes between renders, same function**

**NOTE!** There is no need to removeListener as a cleanup for a component. Whole listener tree will be destroyed when component will be unmounted. Use it only when you explicitly need to remove your side effect for some matter, or if you add your listener conditionally, and want it to be conditionally removed.

<details>
  <summary><b>Example</b></summary>

```typescript
const [addListener, removeListener] = useListenOnAnimationFrame(fn);

const [listenerId, setListenerId] = useState<string>();

useEffect(() => {
  if (somethingGoodHappened) {
    setListenerId(
      addListener(() => {
        // do anything
      })
    );
  }
}, [addListener, somethingGoodHappened]);

useEffect(() => {
  if (somethingBadHappened) {
    removeListener(listenerId);
  }
}, [removeListener, listenerId, somethingBadHappened]);
```

</details>

##### `[ , , stop]`

[See `useAnimationFrame` `stop`](#stop)

##### `[ , , , start]`

[See `useAnimationFrame` `start`](#start)

### When to use `useListenOnAnimationFrame` over `useAnimationFrame`

You might have noticed that you could simply put your function inside `useAnimationFrame`, do side effects inside it, `start` and `stop` it when you need.

It is true, however **you should consider using `useListenOnAnimationFrame` with listeners when you want multiple side effects (or callbacks)** for your function on animation frames because of performance implications.

<details>
  <summary><b>Explanation</b></summary>

Comparing

```typescript
import { useAnimationFrame } from "use-listen-on-animation-frame";

const biggerThan2S = () => {
  if (video.currentTime > 2) {
    console.log("video current time is bigger than 2s");
  }
};

const lesserThan5S = () => {
  if (video.currentTime < 5) {
    console.log("video current time is lesser than 5s");
  }
};

const seekToStartWhenReached10S = () => {
  if (video.currentTime >= 10) {
    video.currentTime = 0;
  }
};

useAnimationFrame(biggerThan2S);
useAnimationFrame(lesserThan5S);
useAnimationFrame(seekToStartWhenReached10S);
```

This will effectively call `video.currentTime` 3 times on every animation frame and do some side effects. Instead, we could track `video.currentTime` specifically once and add listeners to it.

This way, tracked function (`video.currentTime` in this example, but could be something really heavy) will only be invoked once on each animation frame:

```typescript
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const getCurrentTime = () => video.currentTime;

const biggerThan2S = (currentTime) => {
  if (currentTime > 2) {
    console.log("video current time is bigger than 2s");
  }
};

const lesserThan5S = (currentTime) => {
  if (currentTime < 5) {
    console.log("video current time is lesser than 5s");
  }
};

const seekToStartWhenReached10S = (currentTime) => {
  if (currentTime >= 10) {
    video.currentTime = 0;
  }
};

const [addListener] = useListenOnAnimationFrame(getCurrentTime);

useEffect(() => {
  addListener(biggerThan2S);
  addListener(lesserThan5S);
  addListener(seekToStartWhenReached10S);
}, [addListener]);
```

Which will effectively call `video.currentTime` once on each animationFrame and 3 listeners to it.

</details>

## :gear: Advanced usage

### Access previous animation frame function return

If you for some reason need previous animation frame return of your function - it is easily possible.

[Try it on codesandbox](https://codesandbox.io/s/ms-elapsed-from-1970-pwgpft)

<details>
  <summary><b>Source code</b></summary>

```typescript
import React, { useEffect, useState } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const getMsElapsedFrom1970 = (previousFrameTimeElapsed) => {
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

</details>

### Start and stop tracking your function

You can stop and start tracking again whenever you want.

[Try it on codesandbox](https://codesandbox.io/s/controllable-timer-292wmz)

<em>[Btw, compare the above performance with `setInterval`. You couldn't achieve same smoothness when event loop is busy](https://codesandbox.io/s/interval-vs-animation-frame-065es8)</em>

<details>
  <summary><b>Source code</b></summary>

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

  const [addListener, , stop, start] = useListenOnAnimationFrame(getDate, {
    /**
     * optionally indicate that the getDate function and
     * listeners should not be invoked until you `start()`
     */
    autoStart: false,
  });

  useEffect(() => {
    addListener((date) => {
      setCurrentTime(formatDate(date));
    });
  }, [addListener]);

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

</details>

### Optimize/Unoptimize your listeners

By default, if you don't provide [`shouldInvokeListeners` option](#optionsshouldinvokelisteners) - listeners will be invoked only if tracked function return changes. It means that a supplied function will still be invoked on every animation frame, but listeners will not.

[Try it on codesandbox](https://codesandbox.io/s/player-timer-heavy-load-yqz79q)

<details>
  <summary><b>Source code</b></summary>

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
      setVideoCurrentTime(currentTime);
    });
  }, [addNotOptimizedListener]);

  useEffect(() => {
    addOptimizedListener(() => {
      /**
       * does something heavy only when video current time
       * is between 1 and 2 seconds
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

</details>

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

  If you don't need to invoke/listen to a function very frequently and mutate your DOM.

  <b>Ask yourself, is there any other way?</b>
