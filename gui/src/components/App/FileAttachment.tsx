import React from "react";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import codingImg from "./Img/CodingIcon.png";
import csvImg from "./Img/CsvIcon.jpeg";
import docImg from "./Img/DocumentIcon.png";
import excelImg from "./Img/ExcelIcon.jpg";
import movieImg from "./Img/MovIcon.png";
import pdfImg from "./Img/PdfIcon.png";
import pptImg from "./Img/PptIcon.png";
interface Props {
  show: boolean;
  onHide: () => boolean;
  imagePath: string;
  extension: string;
}
const FileAttachment: React.FC<Props> = (props) => {
  const [imagePath, setImagePath] = useState<string>(props.imagePath);

  useEffect(() => {
    setImagePath(props.imagePath);
  }, [props.imagePath]);

  return (
    <div>
      <Modal
        show={props.show}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          {imagePath != null && (
            <>
              <button
                style={{
                  position: "absolute",
                  float: "right",
                  right: "0px",
                  border: "transparent",
                  backgroundColor: "transparent",
                  marginTop: "-18px",
                  marginRight: "-8px",
                  fontSize: "large",
                }}
                onClick={props.onHide}
              >
                <i className="fa fa-window-close" aria-hidden="true"></i>
              </button>
              <img
                style={{ maxHeight: "91vh", maxWidth: "100%" }}
                src={
                  ["XLSX", "XLS", "XLSM", "XLSB", "XLTX"].includes(
                    props.extension
                  )
                    ? excelImg
                    : props.extension == "PDF"
                    ? pdfImg
                    : props.extension == "PPT" || props.extension == "PPTX"
                    ? pptImg
                    : props.extension == "CSV"
                    ? csvImg
                    : props.extension == "MP4" ||
                      props.extension == "MOV" ||
                      props.extension == "MKV"
                    ? movieImg
                    : props.extension == "DOC" ||
                      props.extension == "DOCX" ||
                      props.extension == "TXT"
                    ? docImg
                    : ["PHP", "JS", "CSS", "SCSS", "JSX"].includes(
                        props.extension
                      )
                    ? codingImg
                    : imagePath
                }
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>
            <a
              href={imagePath}
              download=""
              className="image-download-button"
              style={{ color: "white" }}
            >
              Download
            </a>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FileAttachment;
