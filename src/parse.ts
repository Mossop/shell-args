export function bashShellParse(cmdLine: string): string[] {
  enum State {
    Base = 0,
    Normal,
    Single,
    Double,
  }

  let results: string[] = [];
  let current = "";
  let blockStart = 0;
  let pos = 0;
  let state: State = State.Base;

  // Add the current block to the argument.
  function addBlock(): void {
    current += cmdLine.substring(blockStart, pos);
    blockStart = pos + 1;
  }

  // Pushes the current argument to the results.
  function push(): void {
    // Add any pending block.
    addBlock();

    // This might fail at the end of the command line.
    if (current.length) {
      results.push(current);
    }

    // Onto the next argument.
    current = "";
  }

  // What is it escaping?
  function escaped(): string | undefined {
    if (state === State.Single || state === State.Base || pos + 1 >= cmdLine.length) {
      return undefined;
    }

    let next: string = cmdLine.charAt(pos + 1);
    if (state === State.Double) {
      // In double quotes only some things can be escaped.
      if (next === "\"" || next === "\\" || next === "\n") {
        return next;
      }
      return undefined;
    }

    return next;
  }

  while (pos < cmdLine.length) {
    let char: string = cmdLine.charAt(pos);
    let escape: string | undefined = char === "\\" ? escaped() : undefined;

    if (escape) {
      // Cache up to here.
      addBlock();

      if (escape === "\n") {
        // Entirely skip the newline.
        blockStart++;
      }

      // Skip over the escaped character.
      pos += 2;
      continue;
    }

    switch (state) {
      case State.Base: {
        // Still not in an argument?
        if (char === " " || char === "\t" || char === "\n") {
          pos++;
          continue;
        }

        // The new argument starts here.
        blockStart = pos;
        state = State.Normal;

        // Recheck states using the same character.
        continue;
        break;
      }
      case State.Normal: {
        if (char === " " || char === "\t" || char === "\n") {
          // Found the end of the argument.
          push();
          state = State.Base;
        } else if (char === "'") {
          // Start of a single-quoted block.
          addBlock();
          state = State.Single;
        } else if (char === "\"") {
          // Start of a double-quoted block.
          addBlock();
          state = State.Double;
        }

        // Just a regular character to be included in the block.
        break;
      }
      case State.Single: {
        if (char === "'") {
          // End of the block.
          addBlock();
          state = State.Normal;
        }
        break;
      }
      case State.Double: {
        if (char === "\"") {
          // End of the block.
          addBlock();
          state = State.Normal;
        }
        break;
      }
    }

    pos++;
  }

  if (state !== State.Base) {
    push();
  }

  return results;
}

export function winShellParse(cmdLine: string): string[] {
  enum State {
    Base = 0,
    Normal,
    Double,
  }

  let results: string[] = [];
  let current = "";
  let blockStart = 0;
  let pos = 0;
  let state: State = State.Base;
  let escapeCount = 0;

  // Add the current block to the argument.
  function addBlock(): void {
    current += cmdLine.substring(blockStart, pos);
    blockStart = pos + 1;
  }

  // Adds any pending escape characters.
  function addEscapes(): void {
    current += "\\".repeat(escapeCount);
    escapeCount = 0;
  }

  // Pushes the current argument to the results.
  function push(): void {
    // This might fail at the end of the command line.
    if (current.length) {
      results.push(current);
    }

    // Onto the next argument.
    current = "";
  }

  while (pos < cmdLine.length) {
    let char: string = cmdLine.charAt(pos);

    if (char === "\\") {
      if (escapeCount === 0) {
        if (state !== State.Base) {
          addBlock();
        } else {
          state = State.Normal;
        }
      }

      escapeCount++;
    } else if (char === "\"") {
      if (escapeCount % 2) {
        // An escaped double quote.
        escapeCount = (escapeCount - 1) / 2;
        addEscapes();

        // Include the quote in the next block and start processing with the following character.
        blockStart = pos;
      } else {
        if (escapeCount) {
          // An unescaped double quote.
          escapeCount /= 2;
          addEscapes();
        } else if (state !== State.Base) {
          addBlock();
        }

        // Next block starts after the quote, move into the right state and start processing
        // with the next character.
        blockStart = pos + 1;
        if (state === State.Double) {
          state = State.Normal;
        } else {
          state = State.Double;
        }
      }
    } else {
      if (escapeCount) {
        addEscapes();
        blockStart = pos;
      }

      if (char === " " || char === "\t") {
        if (state === State.Normal) {
          // Found the end of the argument.
          addBlock();
          push();
          state = State.Base;
        }
      } else if (state === State.Base) {
        // Found the start of the new argument.
        state = State.Normal;
        blockStart = pos;
      }
    }

    pos++;
  }

  if (state !== State.Base) {
    addEscapes();
    addBlock();
    push();
  }

  return results;
}

export function shellParse(cmdLine: string): string[] {
  if (process.platform === "win32") {
    return winShellParse(cmdLine);
  }
  return bashShellParse(cmdLine);
}
