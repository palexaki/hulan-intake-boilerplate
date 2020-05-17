import React from "react";

type ModalProps = {
  show: boolean;
  onClose: () => void;
};
type ModalState = {};

export default class Modal extends React.Component<ModalProps, ModalState> {
  render() {
    if (this.props.show) {
      return (
        <div className="modal">
          <button className="modal-close" onClick={this.props.onClose}>&times;</button>
          <div className="modal-content">
            {this.props.children}
          </div>
        </div>
      );
    }
    return null;
  }
}
