import { func } from "prop-types";
import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import FileAttachment from "./FileAttachment";
import pdfImg from "./Img/PdfIcon.png";
import codingImg from "./Img/CodingIcon.png";
import csvImg from "./Img/CsvIcon.jpeg";
import docImg from "./Img/DocumentIcon.png";
import movieImg from "./Img/MovIcon.png";
import pptImg from "./Img/PptIcon.png";
import excelImg from "./Img/ExcelIcon.jpg";

function CommentsAttachments(props) {
  const [commentPath, setCommentPath] = useState("");
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    setCommentPath(
      `${props.config.wrapper.url}comment/${props.commentData.comment_id}/attachment/${props.commentData.fileName[props.index]}`
    );
  }, []);
    var extension = props.commentData.fileName[props.index]
      .split(".")
      .pop()
      .toUpperCase();
    console.log(extension);
  return (
    <>
      <FileAttachment
        show={showModal}
        onHide={() => setShowModal(false)}
        imagePath={commentPath}
        extension={extension}
      />
      <div
        style={{
          width: "100%",
          height: "100px",
          cursor: "pointer",
          backgroundColor: "white"
        }}
      >
        <div
          className='thumbnail_preview'
          onClick={() => setShowModal(true)}
          style={{
            width: "30%",
            height: "100px",
            float: "left"
          }}
        >
          <img src={(extension =='XLSX' || extension == 'XLSM' || extension == 'XLS' || extension == 'XLSB' || extension == 'XLTX')? excelImg : extension =='PDF' ? pdfImg: (extension =='PPT' || extension == 'PPTX') ? pptImg:extension =='CSV' ? csvImg:(extension =='MP4' || extension =='MOV' || extension == 'MKV')? movieImg:(extension =='DOC' || extension =='DOCX' || extension == 'TXT')? docImg: (extension =='PHP' || extension =='JS' || extension == 'CSS' || extension == 'SCSS' || extension == 'JSX')? codingImg: commentPath} style={(extension =='XLSX' || extension == 'XLSM' || extension == 'XLS' || extension == 'XLSB' || extension == 'XLTX' || extension =='PDF' || extension =='PPT' || extension == 'PPTX' || extension =='CSV'  || extension =='MP4' || extension =='MOV' || extension == 'MKV' || extension =='DOC' || extension =='DOCX' || extension == 'TXT'|| extension =='PHP' || extension =='JS' || extension == 'CSS' || extension == 'SCSS' || extension == 'JSX')? { width: "70%", height: "100%" }:{ width: "100%", height: "100%" }} />
        </div>
        <div className='attachment_info'>
          <div
            className='attachment_filename'
            style={{
              width: "50%",
              height: "100%",
              float: "left",
              paddingLeft: "10px",
              marginTop: "35px"
            }}
          >
            <span
              style={{
                marginBottom: "30px",
                float: "left",
                width: "100%",
                fontWeight: "bold"
              }}
            >
              {props.fileName}
            </span>
          </div>
          <div
            className='attachment_download'
            style={{
              width: "20%",
              float: "left",
              height: "100px",
              paddingTop: "35px"
            }}
          >
            <a href={commentPath} download='' className='image-download-button'>
              <span className='fa fa-download'> </span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommentsAttachments;
