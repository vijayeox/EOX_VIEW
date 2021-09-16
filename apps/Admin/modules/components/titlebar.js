import { React, KendoReactButtons } from "oxziongui";
import { DropDown } from "./index.js";

export class TitleBar extends React.Component {
  render() {
    return (
      <div
        style={{
          // paddingTop: "12px",
          marginLeft: "0px",
          display: "flex",
          alignItems: "center",
          position: "relative",
          width: "92%",
          top: "5px",
        }}
        className="adminTitleBar"
      >
        {/* <div> */}
        {/* <div
          style={{ marginLeft: "15px", position: "absolute", zIndex: "101" }}
        >
          <KendoReactButtons.Button
            onClick={this.props.menu}
            primary={true}
            style={{
              width: "45px",
              height: "45px",
              position: "relative",
              bottom: "3px",
            }}
          >
            <i className="fa fa-bars"></i>
          </KendoReactButtons.Button>
        </div> */}
        <div className="col text-center" id="pageTitle">
          {this.props.title}
        </div>
        {this.props.orgSwitch ? (
          <div
            style={{
              // right: "65px",
              // top: "4px",
              // position: "absolute",
              zIndex: "1",
              width: "155px",
            }}
          >
            <DropDown
              args={this.props.args}
              mainList={"account"}
              selectedItem={{
                id: "111",
                name: "Switch Account",
              }}
              preFetch={true}
              onDataChange={this.props.orgChange}
            />
          </div>
        ) : null}
      </div>
    );
  }
}
