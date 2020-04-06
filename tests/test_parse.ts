import { bashShellParse, winShellParse } from "../src";

describe("bash", (): void => {
  it("parses basic command lines.", (): void => {
    expect(bashShellParse("")).toStrictEqual([]);
    expect(bashShellParse("   \t  ")).toStrictEqual([]);
    expect(bashShellParse("hello there world")).toStrictEqual(["hello", "there", "world"]);
    expect(bashShellParse("   /foo/bar  \t /bar/baz\t/biz   "))
      .toStrictEqual(["/foo/bar", "/bar/baz", "/biz"]);
  });

  it("handles double quotes.", (): void => {
    expect(bashShellParse("\"basic arg\" \"and another\""))
      .toStrictEqual(["basic arg", "and another"]);
    expect(bashShellParse("\"weird \"arg an\"d a\"nother an\"d again\""))
      .toStrictEqual(["weird arg", "and another", "and again"]);
    expect(bashShellParse("\"can \\\" embed quotes ' like this\""))
      .toStrictEqual(["can \" embed quotes ' like this"]);
  });

  it("handles single quotes.", (): void => {
    expect(bashShellParse("'basic arg' 'and another'"))
      .toStrictEqual(["basic arg", "and another"]);
    expect(bashShellParse("'weird 'arg an'd a'nother an'd again'"))
      .toStrictEqual(["weird arg", "and another", "and again"]);
    expect(bashShellParse("'can \" embed quotes like this'"))
      .toStrictEqual(["can \" embed quotes like this"]);
    expect(bashShellParse("'cannot embed \\'single quotes"))
      .toStrictEqual(["cannot embed \\single", "quotes"]);
  });

  it("handles continuations", (): void => {
    expect(bashShellParse("a long \\\n command line"))
      .toStrictEqual(["a", "long", "command", "line"]);
    expect(bashShellParse("a long\\\ncommand line")).toStrictEqual(["a", "longcommand", "line"]);
    expect(bashShellParse("works \"in \\\n quotes\"")).toStrictEqual(["works", "in  quotes"]);
    expect(bashShellParse("works \"in\\\nquotes\"")).toStrictEqual(["works", "inquotes"]);
    expect(bashShellParse("not 'in\\\nsingle quotes'"))
      .toStrictEqual(["not", "in\\\nsingle quotes"]);
  });

  it("handles braces", (): void => {
    expect(bashShellParse("foo test\\(\\)")).toStrictEqual(["foo", "test()"]);
    expect(bashShellParse("foo 'test()'")).toStrictEqual(["foo", "test()"]);
    expect(bashShellParse("foo \"test()\"")).toStrictEqual(["foo", "test()"]);
  });
});

describe("windows", (): void => {
  it("parses basic command lines.", (): void => {
    expect(winShellParse("")).toStrictEqual([]);
    expect(winShellParse("   \t  ")).toStrictEqual([]);
    expect(winShellParse("hello there world")).toStrictEqual(["hello", "there", "world"]);
    expect(winShellParse("   /foo/bar  \t /bar/baz\t/biz   "))
      .toStrictEqual(["/foo/bar", "/bar/baz", "/biz"]);
  });

  it("handles double quotes.", (): void => {
    expect(winShellParse("\"basic arg\" \"and another\""))
      .toStrictEqual(["basic arg", "and another"]);
    expect(winShellParse("\"weird \"arg an\"d a\"nother an\"d again\""))
      .toStrictEqual(["weird arg", "and another", "and again"]);
    expect(winShellParse("\"can \\\" embed quotes ' like this\""))
      .toStrictEqual(["can \" embed quotes ' like this"]);
    expect(winShellParse("\\\"isn't counted.")).toStrictEqual(["\"isn't", "counted."]);
  });

  it("handles escapes correctly.", (): void => {
    expect(winShellParse("Show\\\\\\\\the result")).toStrictEqual(["Show\\\\\\\\the", "result"]);
    expect(winShellParse("Show\\\\\\the result")).toStrictEqual(["Show\\\\\\the", "result"]);
    expect(winShellParse("Show\\\\\\\"the result")).toStrictEqual(["Show\\\"the", "result"]);
    expect(winShellParse("Show\\\\\\\\\"the result\"")).toStrictEqual(["Show\\\\the result"]);
    expect(winShellParse("Show \\\\\\\\ the result\""))
      .toStrictEqual(["Show", "\\\\\\\\", "the", "result"]);
  });

  it("matches ms docs", (): void => {
    expect(winShellParse("\"a b c\" d e")).toStrictEqual(["a b c", "d", "e"]);
    expect(winShellParse("\"ab\\\"c\" \"\\\\\" d")).toStrictEqual(["ab\"c", "\\", "d"]);
    expect(winShellParse("a\\\\\\b d\"e f\"g h")).toStrictEqual(["a\\\\\\b", "de fg", "h"]);
    expect(winShellParse("a\\\\\\\"b c d")).toStrictEqual(["a\\\"b", "c", "d"]);
    expect(winShellParse("a\\\\\\\\\"b c\" d e")).toStrictEqual(["a\\\\b c", "d", "e"]);
  });
});
