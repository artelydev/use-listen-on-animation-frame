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

<h1>Navigation</h1>

- [Quick start](#quick-start)
- [Docs (website)](https://artelydev.github.io/use-listen-on-animation-frame/)
- [Usage](./docs/usage.md)
- [Why this package](./docs/comparison.md)
- [API](./docs/api.md)
- [Advanced usage](./docs/advanced-usage.md)
- [Q&A](./docs/qa.md)

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
