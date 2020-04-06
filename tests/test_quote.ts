import { bashShellQuote, winShellQuote, bashShellParse, winShellParse } from "../src";

describe("bash", (): void => {
  let check = (args: string[], expected: string): void => {
    let result = bashShellQuote(args);
    expect(result).toStrictEqual(expected);
    expect(bashShellParse(result)).toStrictEqual(args);
  };

  it("quotes basic arguments", (): void => {
    check(["foo", "bar", "baz"], "foo bar baz");
    check(["/foofoo", "/bar", "baz"], "/foofoo /bar baz");
  });

  it("quotes spaced arguments", (): void => {
    check(["foo", "bar biz", "baz"], "foo 'bar biz' baz");
    check(["foo", " bar biz", "baz"], "foo ' bar biz' baz");
    check(["foo", "bar biz ", "baz"], "foo 'bar biz ' baz");
  });

  it("quotes double quotes", (): void => {
    check(["double", "\"test\""], "double '\"test\"'");
    check(["double", "t\"e\"st\""], "double 't\"e\"st\"'");
  });

  it("quotes single quotes", (): void => {
    check(["single", "'test'"], "single \"'test'\"");
    check(["single", "t'e'st'"], "single \"t'e'st'\"");
  });

  it("quotes escapes", (): void => {
    check(["escape", "foo\\ba\\r"], "escape 'foo\\ba\\r'");
  });

  it("handles complex cases", (): void => {
    check(
      ["complex", "foo\"bar'baz bopdiz daz\\oh"],
      "complex \"foo\\\"bar'baz bopdiz daz\\\\oh\"",
    );
  });

  it("quotes braces", (): void => {
    check(["test", "foo()"], "test 'foo()'");
  });
});

describe("windows", (): void => {
  let check = (args: string[], expected: string): void => {
    let result = winShellQuote(args);
    expect(result).toStrictEqual(expected);
    expect(winShellParse(result)).toStrictEqual(args);
  };

  it("quotes basic arguments", (): void => {
    check(["foo", "bar", "baz"], "foo bar baz");
    check(["/foofoo", "/bar", "baz"], "/foofoo /bar baz");
  });

  it("quotes spaced arguments", (): void => {
    check(["foo", "bar biz", "baz"], "foo \"bar biz\" baz");
    check(["foo", " bar biz", "baz"], "foo \" bar biz\" baz");
    check(["foo", "bar biz ", "baz"], "foo \"bar biz \" baz");
  });

  it("quotes double quotes", (): void => {
    check(["double", "\"test\""], "double \\\"test\\\"");
    check(["double", "t\"e\"st\""], "double t\\\"e\\\"st\\\"");
    check(["double", "foo\""], "double foo\\\"");
    check(["double", "foo\\\""], "double foo\\\\\\\"");
    check(["double", "foo\\ \\\""], "double \"foo\\ \\\\\\\"\"");
  });

  it("ignores single quotes", (): void => {
    check(["single", "'test'"], "single 'test'");
    check(["single", "t'e'st'"], "single t'e'st'");
  });

  it("quotes escapes", (): void => {
    check(["escape", "foo\\ba\\r"], "escape foo\\ba\\r");
  });

  it("handles complex cases", (): void => {
    check(["complex", "foo \"test\" bar\\\\baz"], "complex \"foo \\\"test\\\" bar\\\\baz\"");
  });
});
