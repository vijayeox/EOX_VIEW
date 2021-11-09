import React from "react";
import { Table, Input, Button, Skeleton, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import "../src/public/css/TemplateList.css";
import TemplateModal from "./components/Modals/TemplateModal";
import TemplateUploadFile from "./components/Modals/TemplateUploadFileModal";

const LoadingSkeleton = () => (
  <div style={{ padding: "50px" }}>
    <div
      style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}
    >
      <div>
        <Skeleton.Button
          shape="square"
          size="default"
          style={{ marginRight: "10px", width: "130px" }}
        />
      </div>

      <div style={{ display: "inline-flex" }}>
        <Skeleton.Button
          shape="square"
          size="default"
          style={{ marginRight: "10px", width: "100px" }}
        />
        <Skeleton.Button
          shape="square"
          size="default"
          style={{ marginRight: "10px", width: "100px" }}
        />
      </div>
    </div>
    <Skeleton shape="square" width="20" />
    <Skeleton shape="square" width="20" />
  </div>
);
class TemplateManager extends React.Component {
  constructor(props) {
    console.log("calling...template manager")
    super(props);
    this.core = this.props.args;
    this.helper = this.core.make("oxzion/restClient");
    this.state = {
      dataSource: [],
      showModal: false,
      isEditable: false,
      modalContent: null,
      showUploadFileModal: false,
      isDataReady: false,
      search: "",
      filter_templates: []
    };
  }

  componentDidMount() {
    this.getTemplates();
  }

  async getTemplates() {
    let templatesResponse = await this.helper.request(
      "v1",
      "/analytics/template",
      {},
      "get"
    );
    if (templatesResponse.status == "success") {
      let templateList = [];
      templatesResponse.data.data.map((template) =>
        templateList.push({ fileName: template.split(".")[0] })
      );
      this.setState({ dataSource: templateList,filter_templates:[], isDataReady: true });
    }
  }

  async getTemplateContent(fileName) {
    let templatesContent = await this.helper.request(
      "v1",
      "/analytics/template/" + fileName+".tpl",
      {},
      "get"
    );
    if (templatesContent.status == "success") {
      return templatesContent.data;
    }
  }

  async addTemplate(fileName, fileContent,isEditable) {
    let addtemplateReponse = await this.helper.request(
      "v1",
      "/analytics/template",
      { name: fileName, content: fileContent },
      "post"
    );
    if (addtemplateReponse.status == "success") {
      message.success({
        content: isEditable ? "file updated successfully" : "file created successfully",
        style: {
          marginTop: "10vh",
        },
      });
      this.setState({ showModal: false, isDataReady: false});
      this.getTemplates();

    }
  }

  getColumns = () => {
    return [
      {
        title: "Name",
        dataIndex: "fileName",
        key: "fileName",
      },
      {
        title: "Action",
        dataIndex: "templateId",
        key: "templateId",
        render: (text, record) => (
          <span onClick={(key) => this.handleEditTemplate({ record })}>
            <EditOutlined
              style={{
                paddingRight: "10px",
                fontSize: "24px",
                cursor: "pointer",
              }}
            />
          </span>
        ),
      },
    ];
  };

  handleCreateTemplate = () => {
    this.setState({ showModal: true, modalContent: null, isEditable: false });
  };

  handleEditTemplate = (record) => {
    this.getTemplateContent(record.record.fileName).then((response) => {
      this.setState({ showModal: true, modalContent: { fileName: record.record.fileName, fileContent: response.data }, isEditable: true });
    });
  };

  handleEditCancel = () => {
    this.setState({ showModal: false });
  };

  showUploadFile = () => {
    this.setState({ showUploadFileModal: true });
  };

  handleUploadCancel = () => {
    this.setState({ showUploadFileModal: false });
  };

  handleUploadOk = (fileName, fileContent) => {
    this.setState({
      showUploadFileModal: false,
      showModal: true,
      modalContent: { fileName: fileName, fileContent: fileContent },
      isEditable: false
    });
  };

  onEditTemplate = (fileName, fileContent) => {
    this.addTemplate(fileName, fileContent,this.state.isEditable);
  };

  onSaveTemplate = (fileName, fileContent) => {
    const fileExists = this.state.dataSource.some(
      (file) => file.fileName === fileName
    );
    if (!fileExists) {
      this.addTemplate(fileName, fileContent,this.state.isEditable);
    } else {
      message.error({
        content: "filename already exist",
        style: {
          marginTop: "10vh",
        },
      });
    }
  };

  searchInput = (event) => {
    this.setState({
      search: event.target.value,
    });
    return this.searchInputValue(event.target.value);
  };

  searchInputValue = (search) => {
    const filterTemplates = this.state.dataSource.filter(resp => resp.fileName.toLowerCase().includes(search.toLowerCase()))
    this.setState({filter_templates:filterTemplates});
  };

  render() {
    const {
      dataSource,
      isEditable,
      showModal,
      modalContent,
      showUploadFileModal,
      isDataReady,
      filter_templates,
    } = this.state;

    return (
      <>
        {isDataReady ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div className="template-search-header">
              <Input
                style={{ width: "25%" }}
                placeholder="Search template"
                onChange={this.searchInput}
              />
              <div style={{ display: "inline-flex", gap: "4px" }}>
                <Button onClick={this.showUploadFile}>Upload</Button>
                <Button onClick={this.handleCreateTemplate}>
                  New Template
                </Button>
              </div>
            </div>

            <Table
              dataSource={filter_templates.length ? filter_templates : dataSource}
              columns={this.getColumns()}
              pagination={false}
              size="middle"
              scroll={{ y: 240 }}
            />
            {showModal && (
              <div>
                <TemplateModal
                  arg={this.props.arg}
                  isEditable={isEditable}
                  showModal={showModal}
                  content={modalContent}
                  onCancel={this.handleEditCancel}
                  onSaveTemplate={this.onSaveTemplate}
                  onEditTemplate={this.onEditTemplate}
                />
              </div>
            )}
            {showUploadFileModal && (
              <TemplateUploadFile
                arg={this.props.arg}
                showUploadFileModal={this.state.showUploadFileModal}
                onUploadCancel={this.handleUploadCancel}
                onUploadoK={this.handleUploadOk}
              />
            )}
          </div>
        ) : (
          <div>{<LoadingSkeleton />}</div>
        )}
      </>
    );
  }
}

export default TemplateManager;