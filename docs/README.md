<h1>Navigation</h1>

- [Quick start](/)
- [Usage](usage.md)
- [Why this package](comparison.md)
- [API](api.md)
- [Advanced usage](advanced-usage.md)
- [Q&A](qa.md)

## Quick start

### Installation

```bash
$ npm i use-listen-on-animation-frame
```

### Use

Library provides 2 hooks which are `useAnimationFrame`, `useListenOnAnimationFrame`. See [Usage](usage.md), [API](api.md) and [Advanced usage](advanced-usage.md) for more.

#### Basic

Run function on every animation frame

```tsx
import React, { useCallback, useState } from "react";
import { useAnimationFrame } from "use-listen-on-animation-frame";

const getDate = () => new Date();

const Component = () => {
  const [date, setDate] = useState(getDate());

  const setDateOnAnimationFrame = useCallback(() => {
    setDate(getDate());
  }, []);

  useAnimationFrame(setDateOnAnimationFrame);

  return <div>{date}</div>;
};
```

#### Multiple side effects

Run function once on every animation frame, and apply multiple listeners to it. Stop and start function & listeners when you want.

```tsx
import React, { useState } from "react";
import { useListenOnAnimationFrame } from "use-listen-on-animation-frame";

const getCostlyRandomNumber = () => {
  const random = Math.random() * 300;

  let counter = 0;

  for (; counter < random; counter++) {
    counter++;
  }

  return counter;
};

const Component = () => {
  const [number, setNumber] = useState(0);

  const [addListener, _removeListener, stop, start] = useListenOnAnimationFrame(
    getCostlyRandomNumber,
    { autoStart: false } // optional
  );

  useEffect(() => {
    addListener((thisFrameRandom, _previousFrameRandom) => {
      setNumber(thisFrameRandom);
    });

    addListener((thisFrameRandom) => {
      // do something;
    });

    addListener((thisFrameRandom) => {
      for (let i = 0; i < thisFrameRandom; i++) {
        // do something
      }
    });
  }, [addListener]);

  useEffect(() => {
    if (somethingBadHappened) {
      stop();
    }
  }, [stop, somethingBadHappened]);

  useEffect(() => {
    if (somethingGoodHappened) {
      start();
    }
  }, [start, somethingGoodHappened]);

  return (
    <div>
      <span>{number}</span>
      <AnotherComponent
        addFrameListener={addListener}
        stopFrameListening={stop}
      />
    </div>
  );
};
```
