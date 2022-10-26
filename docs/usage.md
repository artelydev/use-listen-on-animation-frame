# Usage

## Do something on animation frames

[Try it on codesandbox](https://codesandbox.io/s/console-date-on-animation-frame-z7xof4)

```tsx
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

---

## Animation frame counter

[Try it on codesandbox](https://codesandbox.io/s/animation-frame-counter-00pfwo)

```tsx
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

---

## Video & current timer

[Try it on codesandbox](https://codesandbox.io/s/player-current-time-3yy31o)

[Btw, compare it to relying on `timeupdate` event](https://codesandbox.io/s/hooks-vs-timeupdate-g6zqgl)

```tsx
import React, { useCallback, useState, useRef } from "react";
import { useAnimationFrame } from "use-listen-on-animation-frame";

const VideoWithCurrentTime: React.FC = () => {
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  /* better memoized */
  const syncVideoCurrentTime = useCallback(() => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  useAnimationFrame(syncVideoCurrentTime);

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

---

## Track your function return on every animation frame

If you need to track your function return on every animation frame and do something with it - go for it!

**Note** that we use `useListenOnAnimationFrame` instead, as we have multiple side effects to the function we want to track.

[Try it on codesandbox](https://codesandbox.io/s/evening-hours-indicator-pwp3wv)

```tsx
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
