/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef } from 'react';
import CallReturnReconcilier from './CallReturnReconcilier';
import { createContainerInfo } from './CallReturnHostConfig';
import { useSubscription } from 'use-subscription';
import { shallowEqualArrays } from 'shallow-equal';

const INITIAL_CHILDREN = {};

const Call = ({ children, props, handler }) => {
  const subscription = useMemo(() => {
    let updating = false;
    let callback = null;
    let returns = [];

    const container = createContainerInfo(() => {
      if (updating) {
        return;
      }
      notifyUpdateIfNecessary();
    });
    const mountNode = CallReturnReconcilier.createContainer(container);

    const retrieveReturns = () => container.children.map(({ value }) => value);

    const notifyUpdateIfNecessary = () => {
      const newReturns = retrieveReturns();
      if (!shallowEqualArrays(newReturns, returns)) {
        returns = newReturns;
        callback?.();
      }
    };

    const unmount = () => {
      CallReturnReconcilier.updateContainer(null, mountNode, null);
    };

    CallReturnReconcilier.updateContainer(children, mountNode, null);
    returns = retrieveReturns();

    return {
      getCurrentValue() {
        return returns;
      },
      subscribe(val) {
        callback = val;
        return () => {
          callback = null;
          unmount();
        };
      },
      update(children) {
        updating = true;
        CallReturnReconcilier.updateContainer(children, mountNode, null);
        updating = false;
        notifyUpdateIfNecessary();
      },
    };
  }, []);

  const returns = useSubscription(subscription);

  const childrenRef = useRef(INITIAL_CHILDREN);
  useEffect(() => {
    if (
      childrenRef.current !== INITIAL_CHILDREN &&
      childrenRef.current !== children
    ) {
      subscription.update(children);
    }
    childrenRef.current = children;
  }, [children]);

  return useMemo(() => handler(props, returns), [props, returns]);
};

function createCall(children, handler, props) {
  return (
    <Call handler={handler} props={props}>
      {children}
    </Call>
  );
}

export default createCall;
