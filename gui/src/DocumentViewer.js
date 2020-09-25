import React, { Component } from "react";
import Accordion from "react-bootstrap/Accordion";
import { useAccordionToggle } from "react-bootstrap/AccordionToggle";
import { Card, Button } from "react-bootstrap";
import "./public/css/documentViewer.scss";
import { Upload } from "@progress/kendo-react-upload";
import Notification from "./Notification";

export default class DocumentViewer extends Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.appId = this.props.appId;
    this.state = {
      selectedDocument: undefined,
      documentsList: undefined,
      documentTypes: [],
      activeCard: "",
      uploadFiles: []
    };
    this.loader = this.core.make("oxzion/splash");
    this.helper = this.core.make("oxzion/restClient");
    this.baseUrl = this.core.config("wrapper.url");
    this.notif = React.createRef();
    var urlRes = this.props.url.split("/");
    this.fileId = urlRes[urlRes.length - 2];
    this.getDocumentsList = this.getDocumentsList.bind(this);
    this.getDocumentsList();
  }

  onFileChange = (event) => {
    let fileError = false;
    let validFiles = event.newState.filter((item) => {
      if (item.validationErrors) {
        if (item.validationErrors.length > 0) {
          fileError = true;
          return false;
        }
      } else {
        return true;
      }
    });

    if (validFiles) {
      this.setState({
        uploadFiles: validFiles
      });
    }
    fileError
      ? this.notif.current.notify(
          "Unsupported File",
          "Please choose a different file.",
          "danger"
        )
      : null;
  };

  showFile(url) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", url, false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          var allText = rawFile.responseText;
          return allText;
        }
      }
    };
    rawFile.send(null);
    return rawFile.onreadystatechange();
  }

  uploadAttachments(fileIndex) {
    if (fileIndex < 0) {
      this.setState(
        {
          selectedDocument: undefined,
          documentsList: undefined,
          documentTypes: [],
          activeCard: "",
          uploadFiles: []
        },
        this.getDocumentsList()
      );
    } else {
      this.postAttachments(this.state.uploadFiles[fileIndex]).then(
        (response) => {
          if (response.status == "success") {
            this.uploadAttachments(fileIndex - 1);
          }
        }
      );
    }
  }

  async postAttachments(file) {
    var urlRes = this.props.url.split("/");
    var fileId = urlRes[urlRes.length - 2];
    let response = await this.helper.request(
      "v1",
      "/app/" + this.appId + "/file/attachment",
      {
        file: file.getRawFile(),
        name: file.name,
        type: "file/" + file.extension.split(".")[1],
        fileId: fileId,
        fieldLabel: this.state.activeCard
      },
      "filepost"
    );

    return response;
  }

  async getDocumentsListService(url) {
    let response = await this.helper.request(
      "v1",
      "/app/" + this.appId + "/" + url,
      {},
      "get"
    );

    return response;
  }

  getDocumentsList = () => {
    if (this.props.url) {
      this.loader.show();
      this.getDocumentsListService(this.props.url).then((response) => {
        if (response.data) {
          var documentsList = {};
          var folderType = {};
          var documentTypes = Object.keys(response.data);
          documentTypes.map((docType) => {
            if (response.data[docType]) {
              if (response.data[docType].value && response.data[docType].type) {
                if (response.data[docType].value.length > 0) {
                  documentsList[docType] = response.data[docType].value;
                  folderType[docType] = response.data[docType].type;
                } else if (response.data[docType].type == "file") {
                  documentsList[docType] = [];
                  folderType[docType] = response.data[docType].type;
                }
              }
            }
          });
          if (Object.keys(documentsList).length > 0) {
            var validDocTypes = Object.keys(documentsList);
            validDocTypes = validDocTypes
              .sort((a, b) => a.localeCompare(b))
              .filter((item) => item !== "Documents");
            documentsList.Documents ? validDocTypes.unshift("Documents") : null;
            this.setState({
              documentsList: documentsList,
              folderType: folderType,
              selectedDocument: documentsList[validDocTypes[0]][0],
              activeCard: validDocTypes[0],
              documentTypes: validDocTypes
            });
          }
          this.loader.destroy();
        }
      });
    }
  };

  componentDidMount() {
    if (this.state.selectedDocument) {
      var documentViewerDiv = document.querySelector(".docViewerWindow");
      this.loader.show(documentViewerDiv);
    }
  }

  async deleteFile(attachementId) {
    return await this.helper.request(
      "v1",
      "/app/" +
        this.appId +
        "/file/" +
        this.fileId +
        "/attachment/" +
        attachementId+"/remove",
      {},
      "delete"
    );
  }

  async renameFile(attachementId, name) {
    return await this.helper.request(
      "v1",
      "/app/" +
        this.appId +
        "/file/" +
        this.fileId +
        "/attachment/" +
        attachementId,
      { name: name },
      "post"
    );
  }

  generateDocumentList() {
    var accordionHTML = [];
    if (this.state.documentTypes) {
      this.state.documentTypes.map((docType, index) => {
        this.state.documentsList[docType]
          ? accordionHTML.push(
              <Card key={index}>
                <Card.Header>
                  <CustomToggle
                    eventKey={docType}
                    currentSelected={this.state.activeCard}
                    type={this.state.folderType[docType]}
                    update={(item) => {
                      this.state.documentsList[item].length !== 0
                        ? this.setState({
                            activeCard: item,
                            selectedDocument: this.state.documentsList[item][0]
                          })
                        : this.setState({
                            activeCard: item
                          });
                    }}
                  >
                    {docType}
                  </CustomToggle>
                </Card.Header>
                <Accordion.Collapse eventKey={docType}>
                  <Card.Body>
                    {this.state.documentsList[docType].map((doc, i) => {
                      return (
                        <Card
                          className="docItems"
                          onClick={(e) => {
                            doc.file != this.state.selectedDocument?(this.state.selectedDocument.file
                              ? this.handleDocumentClick(doc)
                              : null):null;
                          }}
                          key={i}
                        >
                          <div
                            className={
                              doc.file == this.state.selectedDocument?(this.state.selectedDocument.file
                                ? "docListBody borderActive"
                                : "docListBody border"):"docListBody border"
                            }
                          >
                            <i
                              className={"docIcon " + this.getDocIcon(doc.type)}
                            ></i>
                            <p>
                              {doc.originalName && doc.originalName.length > 30
                                ? this.chopFileName(doc.originalName)
                                : doc.originalName}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                    {this.state.folderType[docType] == "file" ? (
                      <div className="popupWindow">
                        <Upload
                          batch={false}
                          multiple={true}
                          autoUpload={false}
                          files={this.state.uploadFiles}
                          onAdd={this.onFileChange}
                          onRemove={this.onFileChange}
                          restrictions={{
                            allowedExtensions: [
                              ".jpg",
                              ".jpeg",
                              ".png",
                              ".gif",
                              ".pdf",
                              ".doc",
                              ".docx",
                              ".xlsx",
                              ".xls",
                              ".txt",
                              ".pst",
                              ".ost",
                            ],
                            maxFileSize: 25000000,
                          }}
                        />
                        <button
                          className={
                            this.state.uploadFiles.length == 0
                              ? "uploadButton invalidButton"
                              : "uploadButton"
                          }
                          disabled={this.state.uploadFiles.length == 0}
                          onClick={(e) => {
                            e.preventDefault();
                            this.loader.show();
                            this.uploadAttachments(
                              this.state.uploadFiles.length - 1
                            );
                          }}
                        >
                          Upload
                        </button>
                      </div>
                    ) : null}
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            )
          : null;
      });
    }
    return accordionHTML;
  }

  getDocIcon(type) {
    try {
      var type = type.split("/")[1].toLowerCase();
      if (type == "png" || type == "jpg" || type == "jpeg" || type == "gif") {
        return "fa fa-picture-o";
      } else if (type == "pdf") {
        return "fa fa-file-pdf-o";
      } else if (type == "mp4" || type == "avi") {
        return "fa fa-file-video-o";
      } else if (type == "plain") {
        return "fas fa-file-alt";
      } else if (
        type == "odt" ||
        type == "odp" ||
        type == "ods" ||
        type == "doc" ||
        type == "docx"
      ) {
        return "fa fa-file-word-o";
      } else {
        return "far fa-file";
      }
    } catch (Exception) {
      return "far fa-file";
    }
  }

  chopFileName = (title) => {
    let type = "...." + title.split(".")[1];
    var displayTitle = title.substring(0, 26) + type;
    return displayTitle;
  };

  handleDocumentClick = (doc) => {
    var documentViewerDiv = document.querySelector(".docViewerWindow");
    this.loader.show(documentViewerDiv);
    this.setState({
      selectedDocument: doc
    });
  };

  displayDocumentData = (documentData) => {
    var url;
    var type = documentData.type.split("/")[1].toLowerCase();
    if (type == "png" || type == "jpg" || type == "jpeg" || type == "gif") {
      url =
        this.baseUrl +
        "app/" +
        this.appId +
        "/document/" +
        documentData.originalName +
        "?docPath=" +
        documentData.file;
      return (
        <React.Fragment>
          <div className="row">
            <div className="col-md-12">
              <input
                type="text"
                id="filename"
                className="form-control"
                value={this.state.selectedDocument.originalName}
                onChange={(e) => {
                  let value = e.target.value;
                  const edited = { ...this.state.selectedDocument };
                  edited["originalName"] = value;
                  this.setState({
                    selectedDocument: edited,
                  });
                }}
              />
              <button
                title="rename"
                className="btn btn-dark"
                onClick={() =>
                  this.renameFile(
                    documentData.uuid,
                    this.state.selectedDocument.originalName
                  )
                }
              >
                <i className="fa fa-floppy-o"></i>
              </button>
              <button
                title="delete"
                className="btn btn-dark"
                onClick={() => this.deleteFile(documentData.uuid)}
              >
                <i className="fa fa-trash"></i>
              </button>
              <a
                href={url}
                download
                target="_blank"
                className="image-download-button"
              >
                <i className="fa fa-download" aria-hidden="true"></i>
                Download
              </a>
            </div>
          </div>
          <img
            onLoad={() => this.loader.destroy()}
            className="img-fluid"
            style={{ height: "100%" }}
            src={url}
          />
        </React.Fragment>
      );
    } else if (type == "mp4" || type == "avi") {
      url =
        this.baseUrl +
        "app/" +
        this.appId +
        "/document/" +
        documentData.originalName +
        "?docPath=" +
        documentData.file;
      return (
        <div>
          <div className="row">
            <div className="col-md-12">
              <input
                type="text"
                id="filename"
                className="form-control"
                value={this.state.selectedDocument.originalName}
                onChange={(e) => {
                  let value = e.target.value;
                  const edited = { ...this.state.selectedDocument };
                  edited["originalName"] = value;
                  this.setState({
                    selectedDocument: edited,
                  });
                }}
              />
              <button
                title="rename"
                className="btn btn-dark"
                onClick={() =>
                  this.renameFile(
                    documentData.uuid,
                    this.state.selectedDocument.originalName
                  )
                }
              >
                <i className="fa fa-floppy-o"></i>
              </button>
              <button
                title="delete"
                className="btn btn-dark"
                onClick={() => this.deleteFile(documentData.uuid)}
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          </div>
          <video
            autoplay
            muted
            preload
            controls
            width="100%"
            onCanPlay={this.loader.destroy()}
          >
            <source src={url} type={"video/" + type} />
            Sorry, your browser doesn't support embedded videos.
          </video>
        </div>
      );
    } else if (type == "pdf") {
      url =
        // this.core.config("ui.url") +
        // "/ViewerJS/#" +
        this.baseUrl +
        "app/" +
        this.appId +
        "/document/" +
        documentData.originalName +
        "?docPath=" +
        documentData.file;
      return (
        <div className="pdf-frame">
          <div className="row">
            <div className="col-md-12">
              <input
                type="text"
                id="filename"
                className="form-control"
                value={this.state.selectedDocument.originalName}
                onChange={(e) => {
                  let value = e.target.value;
                  const edited = { ...this.state.selectedDocument };
                  edited["originalName"] = value;
                  this.setState({
                    selectedDocument: edited,
                  });
                }}
              />
              <button
                title="rename"
                className="btn btn-dark"
                onClick={() =>
                  this.renameFile(
                    documentData.uuid,
                    this.state.selectedDocument.originalName
                  )
                }
              >
                <i className="fa fa-floppy-o"></i>
              </button>
              <button
                title="delete"
                className="btn btn-dark"
                onClick={() => this.deleteFile(documentData.uuid)}
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          </div>
          <iframe
            onLoad={() => {
              setTimeout(() => {
                this.loader.destroy();
              }, 800);
            }}
            key={Math.random() * 20}
            src={url}
            className="iframeDoc"
          ></iframe>
        </div>
      );
    } else if (type == "plain") {
      url =
        this.baseUrl +
        "app/" +
        this.appId +
        "/document/" +
        documentData.originalName +
        "?docPath=" +
        documentData.file;
      this.loader.destroy();
      return (
        <React.Fragment>
          <div className="row">
            <div className="col-md-12">
              <input
                type="text"
                id="filename"
                className="form-control"
                value={this.state.selectedDocument.originalName}
                onChange={(e) => {
                  let value = e.target.value;
                  const edited = { ...this.state.selectedDocument };
                  edited["originalName"] = value;
                  this.setState({
                    selectedDocument: edited,
                  });
                }}
              />
              <button
                title="rename"
                className="btn btn-dark"
                onClick={() =>
                  this.renameFile(
                    documentData.uuid,
                    this.state.selectedDocument.originalName
                  )
                }
              >
                <i className="fa fa-floppy-o"></i>
              </button>
              <button
                title="delete"
                className="btn btn-dark"
                onClick={() => this.deleteFile(documentData.uuid)}
              >
                <i className="fa fa-trash"></i>
              </button>
              <a
                href={url}
                download
                target="_blank"
                className="image-download-button"
              >
                <i className="fa fa-download" aria-hidden="true"></i>
                Download
              </a>
            </div>
          </div>
          <div className="show-text col-md-12">{this.showFile(url)}</div>
        </React.Fragment>
      );
    } else {
      url =
        this.baseUrl +
        "app/" +
        this.appId +
        "/document/" +
        documentData.originalName +
        "?docPath=" +
        documentData.file;
      var url2 =
        this.core.config("ui.url") + "/ViewerJS/images/unsupported_file.jpg";
      this.loader.destroy();
      return (
        <React.Fragment>
          <div className="row">
            <div className="col-md-12">
              <input
                type="text"
                id="filename"
                className="form-control"
                value={this.state.selectedDocument.originalName}
                onChange={(e) => {
                  let value = e.target.value;
                  const edited = { ...this.state.selectedDocument };
                  edited["originalName"] = value;
                  this.setState({
                    selectedDocument: edited,
                  });
                }}
              />
              <button
                title="rename"
                className="btn btn-dark"
                onClick={() =>
                  this.renameFile(
                    documentData.uuid,
                    this.state.selectedDocument.originalName
                  )
                }
              >
                <i className="fa fa-floppy-o"></i>
              </button>
              <button
                title="delete"
                className="btn btn-dark"
                onClick={() => this.deleteFile(documentData.uuid)}
              >
                <i className="fa fa-trash"></i>
              </button>
              <a
                href={url}
                download
                target="_blank"
                className="image-download-button"
              >
                <i className="fa fa-download" aria-hidden="true"></i>
                Download
              </a>
            </div>
          </div>
          <img className="img-fluid" style={{ height: "100%" }} src={url2} />
        </React.Fragment>
      );
    }
  };

  render() {
    const { documentsList } = this.state;
    if (documentsList) {
      return (
        <div className="docViewerComponent">
          <Notification ref={this.notif} />
          <div className="col-md-3 docListDiv">
            <Accordion defaultActiveKey={this.state.documentTypes[0]}>
              {this.generateDocumentList()}
            </Accordion>
          </div>
          <div className="col-md-9 border docViewerWindow">
            {this.state.selectedDocument ? (
              this.displayDocumentData(this.state.selectedDocument)
            ) : (
              <p>No files to display.</p>
            )}
          </div>
        </div>
      );
    } else {
      return <p>No files to display.</p>;
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.url !== prevProps.url) {
      this.getDocumentsList();
    }
  }
}

function CustomToggle(props) {
  return (
    <Button
      variant="primary"
      onClick={
        props.currentSelected !== props.eventKey
          ? useAccordionToggle(props.eventKey, () =>
              props.update.call(undefined, props.eventKey)
            )
          : null
      }
    >
      <i
        className={
          props.currentSelected == props.eventKey
            ? "docIcon fa fa-caret-right rotate90"
            : "docIcon fa fa-caret-right"
        }
      ></i>
      {props.children}
    </Button>
  );
}
