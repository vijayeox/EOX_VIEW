import React from "react";
import { Button, Input, Modal, message, Upload } from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import "../../public/css/TemplateList.css";
const { TextArea } = Input;
const { Dragger } = Upload;

class TemplateUploadFileModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: null,
      fileContent: null,
      showUploadedFile: false,
    };
  }

  handleBefore = (file) => {
    console.log(this.state.fileList != null);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.setState({ fileContent: e.target.result });
        resolve(true);
      };
      reader.readAsText(file);
    });
  };

  handleChange = (info) => {
    let fileList = [...info.fileList];
    if (info.file.status === "done") {
      this.setState({
        showUploadedFile: true,
      });
      console.log("filelist-->", fileList[0]);
    }
    this.setState({ fileList: fileList[0]});
  };

  handleRemove = () => {
    this.setState({
      fileContent: null,
      fileList: null,
      showUploadedFile: false,
    });
  };

  render() {
    const props = {
      action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
      accept: [".tpl",".html"],
      beforeUpload: this.handleBefore,
      onChange: this.handleChange,
      onRemove: this.handleRemove,
      multiple: false,
    };
    const { showUploadFileModal } = this.props;
    const { fileList, fileContent, showUploadedFile, isSuccess } = this.state;
    const fileName = fileList != null ? fileList.name.split(".")[0] : "";

    const Success = () => {
      return message.success({
        content: "File Uploaded Succesfully",
        style: {
          marginTop: "10vh",
        },
      });
    };
    return (
      <div>
        <Modal
          title="Upload Template"
          visible={showUploadFileModal}
          onCancel={this.props.onUploadCancel}
          footer={[
            <Button key="back" onClick={this.props.onUploadCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => this.props.onUploadoK(fileName, fileContent)}
            >
              Upload
            </Button>,
          ]}
        >
          {!showUploadedFile ? (
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <div style={{ textAlign: "center" }}>
                <Button>Choose file</Button>
              </div>
            </Dragger>
          ) : (
            <div className="template-selected-file">
              <div>{fileList.name}</div>
              <div onClick={this.handleRemove}>
                <DeleteOutlined style={{ color: "red", cursor: "pointer" }} />
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }
}
export default TemplateUploadFileModal;