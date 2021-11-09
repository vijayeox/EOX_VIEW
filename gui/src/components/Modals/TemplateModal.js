import React from "react";
import { Button, Input, Modal, Form } from "antd";
const { TextArea } = Input;

class TemplateModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileContent:this.props.content != null ? this.props.content.fileContent : "",
      fileName: this.props.content != null ? this.props.content.fileName : "",
    };
  }

  handleContentChange = (event) => {
    this.setState({ fileContent: event.target.value });
  };

  handlefileName = (event) => {
    this.setState({ fileName: event.target.value });
  };
  render() {
    const { showModal, onCancel, content, isEditable } = this.props;
    const { fileName, fileContent } = this.state;

    return (
      <Modal
        title={isEditable ? "Edit Template" : "Create Template"}
        centered
        visible={showModal}
        onCancel={onCancel}
        width={1000}
        footer={[
          <Button key="back" onClick={onCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() =>
              isEditable
                ? this.props.onEditTemplate(fileName, fileContent)
                : this.props.onSaveTemplate(fileName, fileContent)
            }
          >
            {isEditable ? "Save Changes" : "Save"}
          </Button>,
        ]}
      >
        <Form
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 16,
          }}
          layout="horizontal"
        >
          {isEditable ? (
            <>
              <Form.Item label="File Name">
                <Input value={content.fileName} disabled />
              </Form.Item>
              <Form.Item label="Content">
                <TextArea
                  value={fileContent}
                  autoSize={{ minRows: 10, maxRows: 10 }}
                  onChange={this.handleContentChange}
                ></TextArea>
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item label="File Name">
                <Input
                  placeholder="Enter file name"
                  value={fileName}
                  addonAfter=".tpl"
                  onChange={this.handlefileName}
                />
              </Form.Item>
              <Form.Item label="Content">
                <TextArea
                  id="textarea"
                  value={fileContent}
                  autoSize={{ minRows: 10, maxRows: 10 }}
                  onChange={this.handleContentChange}
                ></TextArea>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    );
  }
}

export default TemplateModal;