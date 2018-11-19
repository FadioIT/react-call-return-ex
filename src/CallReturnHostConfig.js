import { INTERNAL_RETURN_TYPE } from './createReturn';

export function createContainerInfo(callback) {
  let timeout;
  return {
    shouldNotifyUpdate: false,
    children: [],
    tag: 'CONTAINER',
    notifyUpdate() {
      if (this.shouldNotifyUpdate) {
        clearImmediate(timeout);
        timeout = setImmediate(callback);
      }
    },
  };
}

export const now =
  typeof Date.now === 'function' ? Date.now : () => new Date().getTime();

export function getRootHostContext() {
  return {};
}

export function getChildHostContext() {
  return {};
}

export function prepareForCommit() {
  // noop
}

export function resetAfterCommit() {
  // noop
}

export function shouldSetTextContent() {
  return false;
}

export function createInstance(type, props, rootContainerInstance) {
  if (type !== INTERNAL_RETURN_TYPE) {
    throw new Error('Cannot render intrinsic element inside a Call');
  }
  return {
    value: props.value,
    tag: 'RETURN',
    container: rootContainerInstance,
  };
}

export function createTextInstance() {
  throw new Error('Cannot render text element inside a Call');
}

export function appendChild(parent, child) {
  if (parent.tag !== 'CONTAINER') {
    throw new Error('If you face this case, react-call-return is broken');
  }
  parent.children.push(child);
  parent.notifyUpdate();
}

export const appendInitialChild = appendChild;

export function finalizeInitialChildren() {
  return false;
}

export const supportsMutation = true;

export const appendChildToContainer = appendChild;

export function prepareUpdate() {
  return true;
}

export function commitUpdate(
  instance,
  updatePayload,
  type,
  oldProps,
  newProps,
) {
  instance.value = newProps.value;
  instance.container.notifyUpdate();
}

export function commitTextUpdate() {
  throw new Error('If you face this case, react-call-return is broken');
}

export function removeChild(parent, child) {
  const index = parent.children.indexOf(child);
  parent.children.splice(index, 1);
  parent.notifyUpdate();
}

export const removeChildFromContainer = removeChild;
