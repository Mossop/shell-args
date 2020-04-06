# shell-args

A simple set of functions for parsing a command line string into arguments and converting command
line arguments into a correctly escaped string.

Many other npm modules offer this functionality however the only ones I could find only support
unix style escaping and so do not work correctly for windows command lines.

This module exports `bashShellParse`, `winShellParse`, `bashShellQuote` and `winShellQuote`. It
also exports `shellQuote` and `shellParse` which call the function correct for the current platform.

The parse functions accept a string and return an array of strings:
```javascript
import { bashShellQuote } from "shell-args";

bashShellParse("hello there world"); // -> ["hello", "there", "world"]
bashShellParse("\"hello there\" world"); // -> ["hello there", "world"]
bashShellParse(`foo
test\\(\\)`); // -> ["foo", "test()"]
```

The quote functions accept an array of strings and return a string:
```javascript
import { bashShellParse } from "shell-args";

bashShellQuote(["hello", "there", "world"]); // -> "hello there world"
bashShellQuote(["hello there", "world"]); // -> "\"hello there\" world"
bashShellQuote(["foo", "test()"]); // -> ["foo", "test\\(\\)"]
```
