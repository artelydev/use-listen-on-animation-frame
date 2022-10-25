# API

Library provides 2 hooks which are `useAnimationFrame`, `useListenOnAnimationFrame`.

## `useAnimationFrame`

Starts invoking supplied function on every animation frame.

### Arguments

#### `fn`

First argument `fn` - a function to be invoked on every animation frame.

**It's better for this `fn` to be memoized either with `useCallback` or to be defined outside of your component if that still fits your needs**

`fn` might accept a single argument of previous invocation return like in the example:

<details open>
  <summary><b>Example</b></summary>

```tsx
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

---

#### `options`

##### `options.autoStart`

Boolean indicator whether to start invoking function immediately when the hook is used or not. **Defaults** to `true`.

<details>
  <summary><b>Example</b></summary>

```tsx
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

---

### Returns

Returns `[stop, start]` functions.

#### `[stop]`

Function to stop the function from being invoked on every animation frame, and if that was the last function in application still running on animation frame - will effectively `cancelRequestAnimationFrame`.

**You can be assured in it's static reference - no changes between renders, same function**.

<details>
  <summary><b>Example</b></summary>

<!-- prettier-ignore-start -->
```tsx
const [stop] = useAnimationFrame(fn);

useEffect(() => {
  if (somethingIsWrong) {
    stop();
  }
}, [stop]);

```
<!-- prettier-ignore-end -->

</details>

---

#### `[ , start]`

Function to start the function invocations on every animation frame, and if it's the first function in application to be run on animation frame - starts a single animation frame loop.

**You can be assured in it's static reference - no changes between renders, same function**

<details>
  <summary><b>Example</b></summary>

```tsx
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

---

### Note

`useAnimationFrame` is a handy alias for.

```tsx
const [_add, _remove, stop, start] = useListenOnAnimationFrame(fn, {
  autostart,
});

return [stop, start];
```

## `useListenOnAnimationFrame`

### Arguments

#### `fn`

[See `useAnimationFrame` `fn`](#fn)

---

#### `options`

Optional second argument `options`

##### `options.autoStart`

[See `useAnimationFrame` `autoStart`](#optionsautostart)

---

##### `options.shouldInvokeListeners`

Function that accepts 2 arguments `thisFrameReturn` and `previousFrameReturn` and determines if listeners should be invoked on this frame or not.

`previousFrameReturn` can be `undefined` if there was no previous frame return yet.

**It's better for this function to be memoized with `useCallback` or defined outside of your component if it still fits your needs**

<details>
  <summary><b>Example</b></summary>

```tsx
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

---

### Returns

Returns `[addListener, removeListener, stop, start]`;

#### `[addListener]`

Function that accepts your `listener` function.
`listener` in turn accepts 2 arguments `thisFrameReturn` and `previousFrameReturn`.

**Returns** `listenerId: string`, unique uuid of your listener, if you need to remove it later.

**You can be assured in it's static reference - no changes between renders, same function**

<details>
  <summary><b>Example</b></summary>

```tsx
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

---

#### `[ , removeListener]`

Function that accepts `listenerId: string` unique uuid from [`[addListener]`](#addlistener) and removes a listener.

**You can be assured in it's static reference - no changes between renders, same function**

**NOTE!** There is no need to removeListener as a cleanup for a component. Whole listener tree will be destroyed when component will be unmounted. Use it only when you explicitly need to remove your side effect for some matter, or if you add your listener conditionally, and want it to be conditionally removed.

<details>
  <summary><b>Example</b></summary>

```tsx
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

---

#### `[ , , stop]`

[See `useAnimationFrame` `stop`](#stop)

---

#### `[ , , , start]`

[See `useAnimationFrame` `start`](#start)

---

## When to use `useListenOnAnimationFrame` over `useAnimationFrame`

You might have noticed that you could simply put your function inside `useAnimationFrame`, do side effects inside it, `start` and `stop` it when you need.

It is true, however **you should consider using `useListenOnAnimationFrame` with listeners when you want multiple side effects (or callbacks)** for your function on animation frames because of performance implications.

Comparing

```tsx
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

```tsx
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
