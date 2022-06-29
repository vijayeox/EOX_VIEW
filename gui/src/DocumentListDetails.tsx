import React, { Component } from "react";
import { FolderOutlined, FolderFilled } from "@ant-design/icons";
import { Row, Col } from "antd";
import "antd/dist/antd.css";
import "./public/css/DocumentListDetails.css";
import { CoreBase } from "./interfaces";
interface Props {
  core: CoreBase;
  folderData: any;
}
class DocumentListDetails extends React.Component<Props, { folderData: any }> {
  core: CoreBase;
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.state = {
      folderData: this.props.folderData,
    };
  }
  componentDidUpdate(previousProps, prevState) {
    if (previousProps.folderData !== this.props.folderData) {
      this.setState({ folderData: this.props.folderData });
    }
  }
  render() {
    return (
      <div>
        <Row>
          {this.state.folderData ? (
            this.state.folderData.map((document, index) => (
              <div className="each-folder">
                <Col span={8}>
                  <FolderFilled
                    style={{ fontSize: "5rem", color: "#40a9ff" }}
                  />
                </Col>
                <div key={index}>{document.title}</div>
              </div>
            ))
          ) : (
            <div></div>
          )}
        </Row>
      </div>
    );
  }
}

export default DocumentListDetails;
