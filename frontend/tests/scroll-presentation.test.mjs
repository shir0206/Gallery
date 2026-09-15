import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(
  readFileSync(new URL('../src/pages/ArtworkPage/sections/useScrollPresentation.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

function presentation({ viewport, panel, trackHeight, scrollTop }) {
  const properties = new Map();
  const style = { setProperty: (name, value) => properties.set(name, value) };
  const scroller = { clientHeight: viewport, scrollTop, addEventListener() {} };
  const page = { style, dataset: {} };
  const overview = { offsetHeight: panel };
  const track = {
    offsetHeight: trackHeight, offsetTop: 0, style,
    closest: (selector) => selector === '.artwork-page' ? page : scroller,
    querySelector: (selector) => selector === '.artwork-overview' ? overview : null,
    setAttribute() {},
  };
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require: () => ({ useEffect: (effect) => effect() }),
    document: { querySelector: () => null, documentElement: { style } },
    window: { addEventListener() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
  });
  exports.useScrollPresentation({ current: track });
  return properties;
}

test('portrait facts finish revealing before the tall sticky panel releases', () => {
  const values = presentation({ viewport: 601, panel: 1009, trackHeight: 1503, scrollTop: 494 });
  assert.equal(values.get('--facts-in'), '1.0000');
  assert.equal(values.get('--opening'), '0.0000');
  assert.equal(values.get('--section-progress'), '0.0000');
});

test('viewport-sized presentations retain their existing reveal timing', () => {
  const values = presentation({ viewport: 828, panel: 828, trackHeight: 2286, scrollTop: 729 });
  assert.equal(values.get('--p'), '0.5000');
  assert.equal(values.get('--facts-in'), '0.0000');
});
