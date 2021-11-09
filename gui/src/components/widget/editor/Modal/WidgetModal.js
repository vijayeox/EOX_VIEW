import React, { useState, useEffect } from 'react'
import { Button, Modal, Form, Row, Col } from 'react-bootstrap'


function WidgetModal(props) {

  const [input, setInput] = useState({})
  const { deletewidget, ...modalprops } = props

  return (
    <Modal
      {...modalprops}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="datasource-modal"
    >
      <Modal.Header >
        <Modal.Title id="contained-modal-title-vcenter">
          Delete MLET
         </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        Are you sure you want to delete this MLET?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => props.onHide()} >Cancel</Button>
        <Button variant="danger" onClick={() => deletewidget()}>Delete</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default WidgetModal