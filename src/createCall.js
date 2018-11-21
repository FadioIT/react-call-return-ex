import React from 'react';
import CallReturnReconcilier from './CallReturnReconcilier';
import { createContainerInfo } from './CallReturnHostConfig';

class Call extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    this._container = createContainerInfo(this.updateState);
    this._hasUnmounted = false;
    this._updating = false;
    this.state = { returns: [], props: props.props };
  }

  componentDidMount() {
    this._mountNode = CallReturnReconcilier.createContainer(this._container);
    this.updateContainer();
    this.updateState();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.children !== this.props.children) {
      this.updateContainer();
      this.updateState();
    } else if (oldProps.props !== this.props.props) {
      // eslint-disable-next-line
      this.setState({ props: this.props.props });
    }
  }

  componentWillUnmount() {
    this._hasUnmounted = true;
    CallReturnReconcilier.updateContainer(null, this._mountNode, this);
    this.updateState();
  }

  updateState = () => {
    if (this._hasUnmounted || this._updating) {
      return;
    }
    this.setState({
      props: this.props.props,
      returns: this._container.children.map(({ value }) => value),
    });
  };

  updateContainer() {
    this._updating = true;
    CallReturnReconcilier.updateContainer(
      this.props.children,
      this._mountNode,
      this,
    );
    this._updating = false;
  }

  render() {
    const { props, returns } = this.state;
    return this.props.handler(props, returns);
  }
}

function createCall(children, handler, props) {
  return (
    <Call handler={handler} props={props}>
      {children}
    </Call>
  );
}

export default createCall;
