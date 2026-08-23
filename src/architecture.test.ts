import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = join(process.cwd(), "src");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.tsx?$/.test(name) ? [path] : [];
  });
}

function forbiddenImports(layer: string, forbidden: string[]): string[] {
  const directory = join(sourceRoot, layer);
  return sourceFiles(directory).flatMap(path => {
    const source = readFileSync(path, "utf8");
    return forbidden
      .filter(target => source.includes(`@/${target}/`))
      .map(target => `${relative(sourceRoot, path)} -> ${target}`);
  });
}

describe("architecture boundaries", () => {
  it("keeps domain independent from outer layers", () => {
    expect(forbiddenImports("domain", ["application", "infrastructure", "presentation", "app"])).toEqual([]);
  });

  it("keeps application independent from infrastructure and presentation", () => {
    expect(forbiddenImports("application", ["infrastructure", "presentation", "app"])).toEqual([]);
  });

  it("keeps infrastructure independent from presentation and composition", () => {
    expect(forbiddenImports("infrastructure", ["presentation", "app"])).toEqual([]);
  });
});
