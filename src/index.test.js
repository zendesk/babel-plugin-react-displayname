import path from 'path';
import { transformSync } from '@babel/core';

const plugin = path.join(__dirname, './index.js');

const transform = (code) =>
  transformSync(code, {
    babelrc: false,
    configFile: false,
    plugins: [[plugin]],
    presets: [['@babel/preset-react', { pure: false }]],
  }).code;

describe('babelDisplayNamePlugin', () => {
  it('should add display name to function expression components', () => {
    expect(
      transform(`
      foo.bar = function() {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "foo.bar = function () {
        return React.createElement(\\"img\\", null);
      };

      foo.bar.displayName = \\"foo.bar\\";"
    `);

    expect(
      transform(`
      const Test = function() {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "const Test = function () {
        return React.createElement(\\"img\\", null);
      };

      Test.displayName = \\"Test\\";"
    `);
  });

  it('should add display name to named function expression components', () => {
    expect(
      transform(`
      foo.bar = function Foo() {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "foo.bar = function Foo() {
        return React.createElement(\\"img\\", null);
      };

      foo.bar.displayName = \\"foo.bar\\";"
    `);

    expect(
      transform(`
      const Test = function Foo() {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "const Test = function Foo() {
        return React.createElement(\\"img\\", null);
      };

      Test.displayName = \\"Test\\";"
    `);
  });

  it('should add display name to arrow function components', () => {
    expect(
      transform(`
      foo.bar = () => {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "foo.bar = () => {
        return React.createElement(\\"img\\", null);
      };

      foo.bar.displayName = \\"foo.bar\\";"
    `);

    expect(
      transform(`
      const Test = () => {
        return <img/>;
      };`)
    ).toMatchInlineSnapshot(`
      "const Test = () => {
        return React.createElement(\\"img\\", null);
      };

      Test.displayName = \\"Test\\";"
    `);

    expect(
      transform(`
      const Test = () => <img/>;`)
    ).toMatchInlineSnapshot(`
      "const Test = () => React.createElement(\\"img\\", null);

      Test.displayName = \\"Test\\";"
    `);

    expect(
      transform(`
      const Test = () => () => <img/>;`)
    ).toMatchInlineSnapshot(`"const Test = () => () => React.createElement(\\"img\\", null);"`);
  });

  it('should add display name to call expressions', () => {
    expect(
      transform(`
      const Test = React.memo(() => {
        return <img/>;
      })`)
    ).toMatchInlineSnapshot(`
      "const Test = React.memo(function _Test() {
        return React.createElement(\\"img\\", null);
      });
      Test.displayName = \\"Test\\";"
    `);

    expect(
      transform(`
      const foo = {
        bar: React.memo(() => {
          return <img/>;
        })
      };`)
    ).toMatchInlineSnapshot(`
      "const foo = {
        bar: React.memo(function _fooBar() {
          return React.createElement(\\"img\\", null);
        })
      };
      foo.bar.displayName = \\"foo.bar\\";"
    `);

    expect(
      transform(`
      const Test = React.memo(React.createRef((props, ref) => {
        return <img/>;
      }))`)
    ).toMatchInlineSnapshot(`
      "const Test = React.memo(React.createRef(function _Test(props, ref) {
        return React.createElement(\\"img\\", null);
      }));
      Test.displayName = \\"Test\\";"
    `);

    expect(
      transform(`
      const Test = React.memo(function _Test(props, ref) {
        return <img/>;
      })`)
    ).toMatchInlineSnapshot(`
      "const Test = React.memo(function _Test(props, ref) {
        return React.createElement(\\"img\\", null);
      });
      Test.displayName = \\"Test\\";"
    `);

    expect(
      transform(`
      export const Test = React.memo(() => {
        return <img/>;
      })`)
    ).toMatchInlineSnapshot(`
      "export const Test = React.memo(function _Test() {
        return React.createElement(\\"img\\", null);
      });
      Test.displayName = \\"Test\\";"
    `);
  });

  it('should add display name to allowed call expressions', () => {
    expect(
      transform(`
      foo.bar = createComponent();
      foo.bar1 = createComponentWithProxy();
      foo.bar2 = createDirectionalComponent();
      foo.bar3 = createDirectionalComponentWithProxy();
      `)
    ).toMatchInlineSnapshot(`
      "foo.bar = createComponent();
      foo.bar.displayName = \\"foo.bar\\";
      foo.bar1 = createComponentWithProxy();
      foo.bar1.displayName = \\"foo.bar1\\";
      foo.bar2 = createDirectionalComponent();
      foo.bar2.displayName = \\"foo.bar2\\";
      foo.bar3 = createDirectionalComponentWithProxy();
      foo.bar3.displayName = \\"foo.bar3\\";"
    `);

    expect(
      transform(`
      foo = { bar: createComponent() }
      `)
    ).toMatchInlineSnapshot(`
      "foo = {
        bar: createComponent()
      };
      foo.bar.displayName = \\"foo.bar\\";"
    `);

    expect(
      transform(`
      const Test = createComponent();
      `)
    ).toMatchInlineSnapshot(`
      "const Test = createComponent();
      Test.displayName = \\"Test\\";"
    `);
  });

  it('should add display name to object property components', () => {
    expect(
      transform(`
      const Components = {
        path: {
          test: () => <img/>
        }
      };`)
    ).toMatchInlineSnapshot(`
      "const Components = {
        path: {
          test: () => React.createElement(\\"img\\", null)
        }
      };
      Components.path.test.displayName = \\"Components.path.test\\";"
    `);

    expect(
      transform(`
      const pathStr = 'path';
      const Components = {
        [pathStr]: {
          test: () => <img/>
        }
      };`)
    ).toMatchInlineSnapshot(`
      "const pathStr = 'path';
      const Components = {
        [pathStr]: {
          test: () => React.createElement(\\"img\\", null)
        }
      };
      Components[pathStr].test.displayName = \\"Components[pathStr].test\\";"
    `);

    expect(
      transform(`
      const Components = {
        test: function() { return <img/> }
      };`)
    ).toMatchInlineSnapshot(`
      "const Components = {
        test: function () {
          return React.createElement(\\"img\\", null);
        }
      };
      Components.test.displayName = \\"Components.test\\";"
    `);

    expect(
      transform(`
      const Components = {
        test: function Foo() { return <img/> }
      };`)
    ).toMatchInlineSnapshot(`
      "const Components = {
        test: function Foo() {
          return React.createElement(\\"img\\", null);
        }
      };
      Components.test.displayName = \\"Components.test\\";"
    `);
  });

  it('should add display name to object methods', () => {
    expect(
      transform(`
      const Components = {
        path: {
          test(props) {
            return <img/>;
          },
        }
      };
      `)
    ).toMatchInlineSnapshot(`
      "const Components = {
        path: {
          test(props) {
            return React.createElement(\\"img\\", null);
          }

        }
      };
      Components.path.test.displayName = \\"Components.path.test\\";"
    `);

    expect(
      transform(`
      const Components = {
        [foo[bar.foobar].baz]: {
          test(props) {
            return <img/>;
          },
        }
      };
      `)
    ).toMatchInlineSnapshot(`
      "const Components = {
        [foo[bar.foobar].baz]: {
          test(props) {
            return React.createElement(\\"img\\", null);
          }

        }
      };
      Components[foo[bar.foobar].baz].test.displayName = \\"Components[foo[bar.foobar].baz].test\\";"
    `);
  });

  it('should add display name to fragments', () => {
    expect(
      transform(`
      const Component = (props) => <><img {...props} /></>;
      `)
    ).toMatchInlineSnapshot(`
      "const Component = props => React.createElement(React.Fragment, null, React.createElement(\\"img\\", props));

      Component.displayName = \\"Component\\";"
    `);
  });

  it('should add display name to various expressions', () => {
    expect(
      transform(`
      const Component = () => false ? <img/> : null;
      const Component1 = () => <img/> || null;
      const Component2 = () => [<img/>];
      const Component3 = () => { return <img/> };

      `)
    ).toMatchInlineSnapshot(`
      "const Component = () => false ? React.createElement(\\"img\\", null) : null;

      Component.displayName = \\"Component\\";

      const Component1 = () => React.createElement(\\"img\\", null) || null;

      Component1.displayName = \\"Component1\\";

      const Component2 = () => [React.createElement(\\"img\\", null)];

      Component2.displayName = \\"Component2\\";

      const Component3 = () => {
        return React.createElement(\\"img\\", null);
      };

      Component3.displayName = \\"Component3\\";"
    `);
  });

  it('should add display name for various kinds of assignments', () => {
    expect(
      transform(`
      var Test = () => <img/>
      `)
    ).toMatchInlineSnapshot(`
      "var Test = () => React.createElement(\\"img\\", null);

      Test.displayName = \\"Test\\";"
    `);

    expect(
      transform(`
      let Test = () => <img/>
      `)
    ).toMatchInlineSnapshot(`
      "let Test = () => React.createElement(\\"img\\", null);

      Test.displayName = \\"Test\\";"
    `);

    expect(
      transform(`
      export const Test = () => <img/>
      `)
    ).toMatchInlineSnapshot(`
      "export const Test = () => React.createElement(\\"img\\", null);
      Test.displayName = \\"Test\\";"
    `);
  });

  it('should not add display names for nameless functions', () => {
    expect(
      transform(`
      export default () => <img/>
      `)
    ).toMatchInlineSnapshot(`"export default (() => React.createElement(\\"img\\", null));"`);

    expect(
      transform(`
      (() => <img/>)()
      `)
    ).toMatchInlineSnapshot(`"(() => React.createElement(\\"img\\", null))();"`);

    expect(
      transform(`
      {() => <img/>}
      `)
    ).toMatchInlineSnapshot(`
      "{
        () => React.createElement(\\"img\\", null);
      }"
    `);

    expect(
      transform(`
      (function() { return <img/> })()
      `)
    ).toMatchInlineSnapshot(`
      "(function () {
        return React.createElement(\\"img\\", null);
      })();"
    `);

    expect(
      transform(`
      (function test() { return <img/> })()
      `)
    ).toMatchInlineSnapshot(`
      "(function test() {
        return React.createElement(\\"img\\", null);
      })();"
    `);

    expect(
      transform(`
      export default function() { return <img/> }
      `)
    ).toMatchInlineSnapshot(`
      "export default function () {
        return React.createElement(\\"img\\", null);
      }"
    `);
  });

  it('should not move elements out of their current scope', () => {
    expect(
      transform(`
      const Component = (props) => <>{() => <img {...props} />}</>;
      `)
    ).toMatchInlineSnapshot(`
      "const Component = props => React.createElement(React.Fragment, null, () => React.createElement(\\"img\\", props));

      Component.displayName = \\"Component\\";"
    `);

    expect(
      transform(`
      styledComponents.withTheme = (Component) => {
        const WithDefaultTheme = (props) => {
          return <div {...props} />;
        }
        return WithDefaultTheme;
      };
      `)
    ).toMatchInlineSnapshot(`
      "styledComponents.withTheme = Component => {
        const WithDefaultTheme = props => {
          return React.createElement(\\"div\\", props);
        };

        WithDefaultTheme.displayName = \\"WithDefaultTheme\\";
        return WithDefaultTheme;
      };"
    `);

    expect(
      transform(`
      const Component = (options) => {
        return {
          test: function test(props) {
            return <img/>
          },
        };
      };
      `)
    ).toMatchInlineSnapshot(`
      "const Component = options => {
        return {
          test: function test(props) {
            return React.createElement(\\"img\\", null);
          }
        };
      };"
    `);

    expect(
      transform(`
      const Component = (props) => ({ test: <img {...props} /> });
      `)
    ).toMatchInlineSnapshot(`
      "const Component = props => ({
        test: React.createElement(\\"img\\", props)
      });"
    `);

    expect(
      transform(`
      const Component = (props) => {
        const LookUp = ((innerProps) => ({ a: () => <img {...innerProps} /> }))(props);
        return <div>{() => LookUp.a}</div>
      };
      `)
    ).toMatchInlineSnapshot(`
      "const Component = props => {
        const LookUp = (innerProps => ({
          a: () => React.createElement(\\"img\\", innerProps)
        }))(props);

        return React.createElement(\\"div\\", null, () => LookUp.a);
      };

      Component.displayName = \\"Component\\";"
    `);
  });

  it('should add not overwrite existing display names', () => {
    expect(
      transform(`
      foo.bar = createComponent();
      foo.bar.displayName = 'test';
      `)
    ).toMatchInlineSnapshot(`
      "foo.bar = createComponent();
      foo.bar.displayName = 'test';"
    `);

    expect(
      transform(`
      foo.bar = createComponent();
      foo.bar.displayName = 'test';
      foo.bar = createComponent();
      `)
    ).toMatchInlineSnapshot(`
      "foo.bar = createComponent();
      foo.bar.displayName = 'test';
      foo.bar = createComponent();
      foo.bar.displayName = \\"foo.bar\\";"
    `);

    expect(
      transform(`
      foo.bar = createComponent();
      foo.bar.displayName = 'foo.bar';
      foo.bar = createComponent();
      `)
    ).toMatchInlineSnapshot(`
      "foo.bar = createComponent();
      foo.bar.displayName = 'foo.bar';
      foo.bar = createComponent();
      foo.bar.displayName = \\"foo.bar\\";"
    `);
  });

  it('should not add duplicate display names', () => {
    expect(
      transform(`
      () => {
        const Test = createComponent();
      }
      const Test = createComponent();
      `)
    ).toMatchInlineSnapshot(`
      "() => {
        const Test = createComponent();
        Test.displayName = \\"Test\\";
      };

      const Test = createComponent();"
    `);
  });

  it('should not change assignment orders', () => {
    expect(
      transform(`
      foo.bar = createComponent();
      foo.bar = createComponentWithProxy();
      `)
    ).toMatchInlineSnapshot(`
      "foo.bar = createComponent();
      foo.bar.displayName = \\"foo.bar\\";
      foo.bar = createComponentWithProxy();
      foo.bar.displayName = \\"foo.bar\\";"
    `);

    expect(
      transform(`
      foo.bar = createComponent();
      delete foo.bar;
      `)
    ).toMatchInlineSnapshot(`
      "foo.bar = createComponent();
      foo.bar.displayName = \\"foo.bar\\";
      delete foo.bar;"
    `);

    expect(
      transform(`
      foo.bar = createComponent();
      function irrelvant() {};
      foo = null;
      `)
    ).toMatchInlineSnapshot(`
      "foo.bar = createComponent();
      foo.bar.displayName = \\"foo.bar\\";

      function irrelvant() {}

      ;
      foo = null;"
    `);
  });

  it('should not add display name to object properties', () => {
    expect(
      transform(`
      const Components = {
        path: {
          test: <img/>
        }
      };`)
    ).toMatchInlineSnapshot(`
      "const Components = {
        path: {
          test: React.createElement(\\"img\\", null)
        }
      };"
    `);

    expect(
      transform(`
      const Components = () => ({
        path: {
          test: <img/>
        }
      });`)
    ).toMatchInlineSnapshot(`
      "const Components = () => ({
        path: {
          test: React.createElement(\\"img\\", null)
        }
      });"
    `);

    expect(
      transform(`
      const Components = callee({ foo: () => <img/> });
      `)
    ).toMatchInlineSnapshot(`
      "const Components = callee({
        foo: () => React.createElement(\\"img\\", null)
      });"
    `);

    expect(
      transform(`
      const Components = () => <div>{() => <img/>}</div>;
      `)
    ).toMatchInlineSnapshot(`
      "const Components = () => React.createElement(\\"div\\", null, () => React.createElement(\\"img\\", null));

      Components.displayName = \\"Components\\";"
    `);
  });

  it('should not add display name to createClass', () => {
    expect(
      transform(`
      const Component2 = _createClass(() => <img/>);
      `)
    ).toMatchInlineSnapshot(
      `"const Component2 = _createClass(() => React.createElement(\\"img\\", null));"`
    );
  });

  it('should not add display name to hooks', () => {
    expect(
      transform(`
      const Component = useMemo(() => <img/>);
      `)
    ).toMatchInlineSnapshot(
      `"const Component = useMemo(() => React.createElement(\\"img\\", null));"`
    );
  });

  it('should not add display name to class components', () => {
    expect(
      transform(`
      class Test extends React.Component {
        render() {
          return <img/>;
        }
      }`)
    ).toMatchInlineSnapshot(`
      "class Test extends React.Component {
        render() {
          return React.createElement(\\"img\\", null);
        }

      }"
    `);

    expect(
      transform(`
      class Test extends React.Component {
        notRender() {
          return <img/>;
        }
      }`)
    ).toMatchInlineSnapshot(`
      "class Test extends React.Component {
        notRender() {
          return React.createElement(\\"img\\", null);
        }

      }"
    `);

    expect(
      transform(`
      export class Test extends React.Component {
        render() {
          return <img/>;
        }
      }`)
    ).toMatchInlineSnapshot(`
      "export class Test extends React.Component {
        render() {
          return React.createElement(\\"img\\", null);
        }

      }"
    `);

    expect(
      transform(`
      export default class Test extends React.Component {
        render() {
          return <img/>;
        }
      }`)
    ).toMatchInlineSnapshot(`
      "export default class Test extends React.Component {
        render() {
          return React.createElement(\\"img\\", null);
        }

      }"
    `);
  });

  it('should not add display name to function components', () => {
    expect(
      transform(`
      function Test() {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "function Test() {
        return React.createElement(\\"img\\", null);
      }"
    `);

    expect(
      transform(`
      export function Test() {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "export function Test() {
        return React.createElement(\\"img\\", null);
      }"
    `);

    expect(
      transform(`
      export default function Test() {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "export default function Test() {
        return React.createElement(\\"img\\", null);
      }"
    `);

    expect(
      transform(`
      export default function() {
        return <img/>;
      }`)
    ).toMatchInlineSnapshot(`
      "export default function () {
        return React.createElement(\\"img\\", null);
      }"
    `);
  });

  it('should not add display name to immediately invoked function expressions', () => {
    expect(
      transform(`
      const Test = (function () {
        return <img/>;
      })()`)
    ).toMatchInlineSnapshot(`
      "const Test = function () {
        return React.createElement(\\"img\\", null);
      }();"
    `);

    expect(
      transform(`
      const Test = (function test() {
        return <img/>;
      })()`)
    ).toMatchInlineSnapshot(`
      "const Test = function test() {
        return React.createElement(\\"img\\", null);
      }();"
    `);

    expect(
      transform(`
      const Test = (() => {
        return <img/>;
      })()`)
    ).toMatchInlineSnapshot(`
      "const Test = (() => {
        return React.createElement(\\"img\\", null);
      })();"
    `);
  });

  it('should not add display name to functions within jsx elements', () => {
    expect(
      transform(`
      const Test = callee(<div>{() => <img/>}</div>);
      `)
    ).toMatchInlineSnapshot(
      `"const Test = callee(React.createElement(\\"div\\", null, () => React.createElement(\\"img\\", null)));"`
    );

    expect(
      transform(`
      const Test = () => <img foo={{ bar: () => <img/> }} />;
      `)
    ).toMatchInlineSnapshot(`
      "const Test = () => React.createElement(\\"img\\", {
        foo: {
          bar: () => React.createElement(\\"img\\", null)
        }
      });

      Test.displayName = \\"Test\\";"
    `);
  });

  it('should not add display name to non react components', () => {
    expect(
      transform(`
      // foo.bar = createComponent();
      const Component = '';
      const Component1 = null;
      const Component2 = undefined;
      const Component3 = 0;
      let Component4;
      var Component5;
      const Component6 = ['foo', 5, null, undefined];
      const Component7 = { foo: 'bar' };
      const Component8 = new Wrapper();
      const Component9 = () => {};
      `)
    ).toMatchInlineSnapshot(`
      "// foo.bar = createComponent();
      const Component = '';
      const Component1 = null;
      const Component2 = undefined;
      const Component3 = 0;
      let Component4;
      var Component5;
      const Component6 = ['foo', 5, null, undefined];
      const Component7 = {
        foo: 'bar'
      };
      const Component8 = new Wrapper();

      const Component9 = () => {};"
    `);
  });

  it('should not add display name to other assignments', () => {
    expect(
      transform(`
      const Component = <img/>;
      const Component1 = [<img/>];
      const Component2 = new Wrapper(<img/>);
      const Component3 = async (props) => await <img/>;
      const Component4 = callee(<img/>);
      `)
    ).toMatchInlineSnapshot(`
      "const Component = React.createElement(\\"img\\", null);
      const Component1 = [React.createElement(\\"img\\", null)];
      const Component2 = new Wrapper(React.createElement(\\"img\\", null));

      const Component3 = async props => await React.createElement(\\"img\\", null);

      const Component4 = callee(React.createElement(\\"img\\", null));"
    `);
  });
});
