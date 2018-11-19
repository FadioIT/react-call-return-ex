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
    const { elements, props } = this.props;

    this._container.shouldNotifyUpdate = false;
    this._container.props = props;
    this._mountNode = CallReturnReconcilier.createContainer(this._container);
    CallReturnReconcilier.updateContainer(elements, this._mountNode, this);
    this.updateState();
    this._container.shouldNotifyUpdate = true;
  }

  componentDidUpdate(oldProps) {
    if (
      oldProps.elements !== this.props.elements ||
      oldProps.props !== this.props.props
    ) {
      this._container.shouldNotifyUpdate = false;
      this._container.props = this.props.props;
      CallReturnReconcilier.updateContainer(
        this.props.elements,
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
      returns: this._container.children.map(({ props }) => props),
    });
  };

  render() {
    return this.props.children(this.state.props, this.state.returns);
  }
}

export default Call;
