/* global describe, it, expect, jest */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import Call from '../Call';
import Return from '../Return';

jest.useFakeTimers();

describe('ReactCallReturn', () => {
  it('should render a call', () => {
    const ops = [];

    function Continuation({ isSame }) {
      ops.push(['Continuation', isSame]);
      return <span prop={isSame ? 'foo==bar' : 'foo!=bar'} />;
    }

    function Child({ bar }) {
      ops.push(['Child', bar]);
      return <Return props={{ bar }} continuation={Continuation} />;
    }

    function Indirection() {
      ops.push('Indirection');
      return [<Child key="a" bar />, <Child key="b" bar={false} />];
    }

    // An alternative API could mark Parent as something that needs
    // returning. E.g. Parent.handler = HandleReturns;
    function Parent(props) {
      ops.push('Parent');
      return (
        <Call props={props} elements={props.children}>
          {(props, returns) => {
            ops.push('HandleReturns');
            return returns.map((y, i) => (
              <y.continuation key={i} isSame={props.foo === y.props.bar} />
            ));
          }}
        </Call>
      );
    }

    function App() {
      return (
        <div>
          <Parent foo>
            <Indirection />
          </Parent>
        </div>
      );
    }

    const renderer = ReactTestRenderer.create(<App />);

    expect(ops).toEqual([
      'Parent',
      // this is the flaw of this implementation, on first render
      // we have returns equals []
      'HandleReturns',
      'Indirection',
      ['Child', true],
      // Return
      ['Child', false],
      // Return
      'HandleReturns',
      // Call continuations
      ['Continuation', true],
      ['Continuation', false],
    ]);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it('should update a call', () => {
    function Continuation({ isSame }) {
      return <span prop={isSame ? 'foo==bar' : 'foo!=bar'} />;
    }

    function Child({ bar }) {
      return <Return props={{ bar }} continuation={Continuation} />;
    }

    function Indirection() {
      return [<Child key="a" bar />, <Child key="b" bar={false} />];
    }

    function Parent(props) {
      return (
        <Call props={props} elements={props.children}>
          {(props, returns) =>
            returns.map((y, i) => (
              <y.continuation key={i} isSame={props.foo === y.props.bar} />
            ))
          }
        </Call>
      );
    }

    function App(props) {
      return (
        <div>
          <Parent foo={props.foo}>
            <Indirection />
          </Parent>
        </div>
      );
    }

    const renderer = ReactTestRenderer.create(<App foo />);
    expect(renderer.toJSON()).toMatchSnapshot();

    renderer.update(<App foo={false} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it('should unmount a composite in a call', () => {
    let ops = [];

    class Continuation extends React.Component {
      componentWillUnmount() {
        ops.push('Unmount Continuation');
      }

      render() {
        ops.push('Continuation');
        return <div />;
      }
    }

    class Child extends React.Component {
      componentWillUnmount() {
        ops.push('Unmount Child');
      }

      render() {
        ops.push('Child');
        return <Return continuation={Continuation} />;
      }
    }

    class Parent extends React.Component {
      componentWillUnmount() {
        ops.push('Unmount Parent');
      }

      render() {
        ops.push('Parent');

        return (
          <Call props={this.props} elements={this.props.children}>
            {(props, returns) => {
              ops.push('HandleReturns');
              return returns.map(
                ({ continuation: ContinuationComponent }, i) => (
                  <ContinuationComponent key={i} />
                ),
              );
            }}
          </Call>
        );
      }
    }

    const renderer = ReactTestRenderer.create(
      <Parent>
        <Child />
      </Parent>,
    );

    expect(ops).toEqual([
      'Parent',
      'HandleReturns', // initial render problem
      'Child',
      'HandleReturns',
      'Continuation',
    ]);

    ops = [];

    renderer.update(<div />);

    expect(ops).toEqual([
      'Unmount Parent',
      'Unmount Child',
      'Unmount Continuation',
    ]);
  });

  it('should handle deep updates in call', () => {
    const instances = {};

    class Counter extends React.Component {
      state = { value: 5 };

      render() {
        instances[this.props.id] = this;
        return <Return value={this.state.value} />;
      }
    }

    function App() {
      return (
        <Call
          elements={[
            <Counter key="a" id="a" />,
            <Counter key="b" id="b" />,
            <Counter key="c" id="c" />,
          ]}
        >
          {(p, returns) =>
            returns.map(({ value }, i) => <span key={i} prop={value * 100} />)
          }
        </Call>
      );
    }

    const renderer = ReactTestRenderer.create(<App />);
    expect(renderer.toJSON()).toMatchSnapshot();

    instances.a.setState({ value: 1 });
    instances.b.setState({ value: 2 });

    jest.runAllTimers();

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it('should unmount and remount children', () => {
    let ops = [];

    function TCall(props) {
      return (
        <Call elements={props.children}>
          {(p, returns) => returns.map(({ value }) => value)}
        </Call>
      );
    }

    class TReturn extends React.Component {
      // eslint-disable-next-line
      UNSAFE_componentWillMount() {
        ops.push(`Mount Return ${this.props.value}`);
      }

      componentWillUnmount() {
        ops.push(`Unmount Return ${this.props.value}`);
      }

      render() {
        ops.push(`Return ${this.props.value}`);
        return <Return value={this.props.value} />;
      }
    }

    const render = ReactTestRenderer.create(
      <TCall>
        <TReturn value={1} />
        <TReturn value={2} />
      </TCall>,
    );

    expect(ops).toEqual([
      'Mount Return 1',
      'Return 1',
      'Mount Return 2',
      'Return 2',
    ]);

    ops = [];

    render.update(<TCall />);

    expect(ops).toEqual(['Unmount Return 1', 'Unmount Return 2']);

    ops = [];

    render.update(
      <TCall>
        <TReturn value={3} />
      </TCall>,
    );

    expect(ops).toEqual(['Mount Return 3', 'Return 3']);
  });
});
