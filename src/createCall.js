import React from 'react';
import CallReturnReconcilier from './CallReturnReconcilier';
import { createContainerInfo } from './CallReturnHostConfig';

class Call extends React.PureComponent {
  constructor(props, context, updater) {
    super(props, context, updater);
    this.state = { returns: [] };
    this._container = createContainerInfo(this.updateState);
  }

  componentDidMount() {
    const { children, props } = this.props;

    this._container.shouldNotifyUpdate = false;
    this._container.props = props;
    this._mountNode = CallReturnReconcilier.createContainer(this._container);
    CallReturnReconcilier.updateContainer(children, this._mountNode, this);
    this.updateState();
    this._container.shouldNotifyUpdate = true;
  }

  componentDidUpdate(oldProps) {
    if (
      oldProps.children !== this.props.children ||
      oldProps.props !== this.props.props
    ) {
      this._container.shouldNotifyUpdate = false;
      this._container.props = this.props.props;
      CallReturnReconcilier.updateContainer(
        this.props.children,
        this._mountNode,
        this,
      );
      this.updateState();
      this._container.shouldNotifyUpdate = true;
    }
  }

  componentWillUnmount() {
    this._container.shouldNotifyUpdate = false;
    CallReturnReconcilier.updateContainer(null, this._mountNode, this);
  }

  updateState = () => {
    this.setState({
      props: this._container.props,
      returns: this._container.children.map(({ value }) => value),
    });
  };

  render() {
    return this.props.handler(this.state.props, this.state.returns);
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
