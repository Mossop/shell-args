export function bashShellQuote(args: string[]): string {
  return args.map((a: string): string => {
    function contains(str: string): boolean {
      for (let i = 0; i < str.length; i++) {
        if (a.includes(str.charAt(i))) {
          return true;
        }
      }
      return false;
    }

    if (!contains("\"' \\()")) {
      return a;
    }

    if (!contains("'")) {
      return `'${a}'`;
    }

    return "\"" + a.replace(/\\/g, "\\\\").replace(/[()"\n]/g, "\\$&") + "\"";
  }).join(" ");
}

export function winShellQuote(args: string[]): string {
  return args.map((a: string): string => {
    function contains(str: string): boolean {
      for (let i = 0; i < str.length; i++) {
        if (a.includes(str.charAt(i))) {
          return true;
        }
      }
      return false;
    }

    if (!contains("\"' \\")) {
      return a;
    }

    let escaped: string = a.replace(/\\*"|\\+/g, (match: string): string => {
      if (!match.endsWith("\\")) {
        let count: number = match.length - 1;
        return "\\".repeat(count * 2 + 1) + "\"";
      }
      return match;
    });

    if (contains(" ")) {
      return "\"" + escaped + "\"";
    }
    return escaped;
  }).join(" ");
}

export function shellQuote(args: string[]): string {
  if (process.platform === "win32") {
    return winShellQuote(args);
  }
  return bashShellQuote(args);
}
