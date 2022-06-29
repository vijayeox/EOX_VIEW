import { Col, PageHeader, Row, Tree } from "antd";
import "antd/dist/antd.css";
import React from "react";
import DocumentListDetails from "./DocumentListDetails";
import { CoreBase } from "./interfaces";
import "./public/css/DocumentList.css";
const { DirectoryTree } = Tree;
interface Props {
  core: CoreBase;
  treeData: any;
  folderData: any;
  onSelect: (...args) => void;
  onExpand: (...args) => void;
  loadData: (...args) => any;
}
class DocumentList extends React.Component<
  Props,
  { treeData: any; folderData: any }
> {
  core: CoreBase;
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.state = {
      treeData: this.props.treeData,
      folderData: this.props.folderData,
    };
  }
  componentDidUpdate(previousProps, prevState) {
    if (previousProps.treeData !== this.props.treeData) {
      this.setState({ treeData: this.props.treeData });
    }
    if (previousProps.folderData !== this.props.folderData) {
      this.setState({ folderData: this.props.folderData });
    }
  }

  render() {
    const DirectoryTreeComp = DirectoryTree as any;
    return (
      <div className="document-container">
        <PageHeader className="site-page-header" title="Document manager" />
        <Row className="document-row">
          <Col span={4} className="document-left-panel">
            <DirectoryTreeComp
              multiple
              onSelect={this.props.onSelect}
              onExpand={this.props.onExpand}
              loadData={this.props.loadData}
              treeData={this.state.treeData}
              folderData={this.state.folderData}
            />
          </Col>
          <Col span={20}>
            <DocumentListDetails
              folderData={this.state.folderData}
              core={this.core}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default DocumentList;
