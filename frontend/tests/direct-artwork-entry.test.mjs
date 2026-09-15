import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Render the route composition without mounting browser effects. This catches
// a direct URL being sent to a separate presentation instead of the wall flow.
function renderRoute(state = null) {
  const source = ts.transpileModule(
    readFileSync(new URL('../src/pages/GalleryPage.tsx', import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  ).outputText;
  const exports = {};
  const artwork = { id: 'wind', title: 'Wind' };
  const jsx = (type, props) => ({ type, props });
  vm.runInNewContext(source, {
    exports,
    require: (name) => {
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'Fragment' };
      if (name === 'react') return {
        useState: (value) => [typeof value === 'function' ? value() : value, () => {}],
        useRef: (value) => ({ current: value }), useEffect() {}, useCallback: (fn) => fn,
      };
      if (name === 'react-router-dom') return {
        Route: 'Route', Routes: 'Routes', Navigate: 'Navigate',
        useLocation: () => ({ pathname: '/artworks/wind', state }),
        useNavigate: () => () => {}, matchPath: () => ({ params: { artworkSlug: 'wind' } }),
      };
      if (name.includes('ArtworkCollectionContext')) return {
        useArtworkCollection: () => ({ data: { artworks: [artwork] } }),
      };
      return new Proxy({}, { get: (_, key) => key });
    },
  });
  const tree = exports.GalleryPage();
  const nodes = [];
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push(node);
    visit(node.props?.children);
  };
  visit(tree);
  return nodes;
}

test('direct URLs initialize the same gallery opening flow before showing the feature', () => {
  const nodes = renderRoute();
  const route = nodes.find(node => node.props?.path === '/artworks/:artworkSlug');
  assert.equal(route.props.element.type, 'Gallery');
  assert.equal(route.props.element.props.autoOpenArtworkId, 'wind');
  assert.equal(nodes.some(node => node.type === 'ArtworkPage'), false);
});

test('refreshing a wall-backed URL also initializes its lost camera state', () => {
  const nodes = renderRoute({ backgroundPath: '/' });
  const route = nodes.find(node => node.props?.path === '/artworks/:artworkSlug');
  assert.equal(route.props.element.props.autoOpenArtworkId, 'wind');
});

test('cart previews remain standalone previews', () => {
  const nodes = renderRoute({ staticPreview: true, returnPath: '/cart' });
  assert.equal(nodes.find(node => node.type === 'ArtworkPage').props.isStaticPreview, true);
});
