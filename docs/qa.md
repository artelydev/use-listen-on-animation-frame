# Q&A

## Why would you even consider using animation frames?

For animations! <b>But it's not the only case</b>.

You can use it as a better replacement for frequent `setInterval`.

What if I told you that e.g. [`timeupdate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event) of HTML5 video could be fired 4 times per second?

And you're building your own video editor and want to animate your custom timeline? Would you move the playhead or current time in your video editor 4 times per second? I believe you would want the smoothest transition you can do.

Then what about `setInterval` and check the video current time? That's possible, but how you would determine the frequency? 30Hz? 50Hz? 200Hz? That's a performance implication question already. Also if you would do any animations - high-frequency `setInterval` will flicker & shear your DOM.

Also `setInterval` [is](https://blog.bitsrc.io/how-to-get-an-accurate-setinterval-in-javascript-ca7623d1d26a). [known](https://thecodersblog.com/increase-javascript-timoeout-accuracy). [for](https://www.reddit.com/r/learnjavascript/comments/3aqtzf/issue_with_setinterval_function_losing_accuracy/). [it's](https://github.com/dbkaplun/driftless). [inconsistency](https://abhi9bakshi.medium.com/why-javascript-timer-is-unreliable-and-how-can-you-fix-it-9ff5e6d34ee0).

Wouldn't it be better to rely on the browser repaint frequency? Especially handy when you want to do animations because it's invoked [before the repaint](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)!

## When you should use this package?

If you need to invoke/listen to a function at extreme frequency mutating DOM, animating something, and you want to ensure the smoothness and consistency of what you do.

Or if you need a `setInterval` with less than `50ms` and you want it to be somewhat consistent.

## When you should **not** use this package?

If you don't need to invoke/listen to a function very frequently and mutate your DOM.

<b>Ask yourself, is there any other way?</b>
