import { useEffect, useMemo, useRef, useState } from 'react';
import CallReturnReconcilier from './CallReturnReconcilier';
import { createContainerInfo } from './CallReturnHostConfig';
import { shallowEqualArrays } from 'shallow-equal';

const createCallRenderer = (callback) => {
  let updating = false;
  let returns = null;

  const container = createContainerInfo(() => {
    if (updating) {
      return;
    }
    const newReturns = retrieveReturns();
    if (!shallowEqualArrays(newReturns, returns)) {
      returns = newReturns;
      callback?.();
    }
  });

  const mountNode = CallReturnReconcilier.createContainer(container);

  const retrieveReturns = () => container.children.map(({ value }) => value);

  return {
    getReturns() {
      return returns;
    },
    render(children) {
      updating = true;
      CallReturnReconcilier.updateContainer(children, mountNode, null);
      updating = false;
      returns = retrieveReturns();
    },
    unmount() {
      CallReturnReconcilier.updateContainer(null, mountNode, null);
    },
  };
};

const Call = ({ children, props, handler }) => {
  const [, forceUpdate] = useState(null);
  const renderer = useMemo(() => createCallRenderer(forceUpdate), []);
  const childrenRef = useRef(null);
  if (childrenRef.current !== children) {
    childrenRef.current = children;
    renderer.render(childrenRef.current);
  }
  useEffect(
    () => () => {
      renderer.unmount();
    },
    [],
  );
  return handler(props, renderer.getReturns());
};

function createCall(children, handler, props) {
  return (
    <Call handler={handler} props={props}>
      {children}
    </Call>
  );
}

export default createCall;
