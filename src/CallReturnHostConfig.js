import { INTERNAL_RETURN_TYPE } from './createReturn';

export function createContainerInfo(callback) {
  return {
    children: [],
    tag: 'CONTAINER',
    notifyUpdate: callback,
  };
}

export const supportsMutation = true;
export const UPDATE_SIGNAL = {};

export const createInstance = (type, props, rootContainer) => {
  if (type !== INTERNAL_RETURN_TYPE) {
    throw new Error('Cannot render intrinsic element inside a Call');
  }
  return {
    value: props.value,
    tag: 'RETURN',
    container: rootContainer,
    hidden: false,
  };
};

export function createTextInstance() {
  throw new Error('Cannot render text element inside a Call');
}

export function appendInitialChild(parent, child) {
  if (parent.tag !== 'CONTAINER') {
    throw new Error('If you face this case, react-call-return is broken');
  }
  parent.children.push(child);
}

export function finalizeInitialChildren() {
  return false;
}

export function prepareUpdate() {
  return UPDATE_SIGNAL;
}

export function shouldSetTextContent() {
  return false;
}

export function getRootHostContext() {
  return {};
}

export function getChildHostContext() {
  return {};
}

export function getPublicInstance(instance) {
  return instance;
}

export function prepareForCommit() {
  return null;
}

export function resetAfterCommit(container) {
  container.notifyUpdate();
}

export const now =
  typeof Date.now === 'function' ? Date.now : () => new Date().getTime();

export const scheduleTimeout = setTimeout;

export const cancelTimeout = clearTimeout;

export const noTimeout = -1;

export const supportsMicrotask = false;

export const isPrimaryRenderer = false;

export const appendChild = appendInitialChild;

export const appendChildToContainer = appendInitialChild;

export function insertBefore(parent, child, beforeChild) {
  if (parent.tag !== 'CONTAINER') {
    throw new Error('If you face this case, react-call-return is broken');
  }
  const index = parent.children.indexOf(beforeChild);
  if (index !== -1) {
    parent.splice(index, 0, child);
  } else {
    parent.push(child);
  }
}

export const insertInContainerBefore = insertBefore;

export function removeChild(parent, child) {
  const index = parent.children.indexOf(child);
  if (index !== -1) {
    parent.children.splice(index, 1);
  }
}

export const removeChildFromContainer = removeChild;

export const resetTextContent = () => {};

export function commitTextUpdate() {
  throw new Error('If you face this case, react-call-return is broken');
}

export const commitMount = () => {};

export function commitUpdate(
  instance,
  updatePayload,
  type,
  oldProps,
  newProps,
) {
  instance.value = newProps.value;
}

export function hideInstance(instance) {
  instance.hidden = true;
}

export function hideTextInstance() {
  throw new Error('If you face this case, react-call-return is broken');
}

export function unhideInstance(instance) {
  instance.hidden = false;
}

export function unhideTextInstance() {
  throw new Error('If you face this case, react-call-return is broken');
}

export function clearContainer(container) {
  container.children.length = 0;
}
