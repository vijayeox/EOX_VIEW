import {React,KendoReactButtons} from "oxziongui";
import { DropDown } from "./index.js";

export class TitleBar extends React.Component {
  render() {
    return (
      <div
        style={{ paddingTop: "12px", marginLeft: "0px" }}
        className="adminTitleBar"
      >
        <div
          style={{ marginLeft: "15px", position: "absolute", zIndex: "101" }}
        >
          <KendoReactButtons.Button
            onClick={this.props.menu}
            primary={true}
            style={{
              width: "45px",
              height: "45px",
              position: "relative",
              bottom: "3px"
            }}
          >
            <i className="fa fa-bars"></i>
          </KendoReactButtons.Button>
        </div>
        <div className="col text-center" id="pageTitle">
          {this.props.title}
        </div>
        {this.props.orgSwitch ? (
          <div
            style={{
              right: "15px",
              top: "15px",
              position: "absolute",
              zIndex: "100",
              width: "200px"
            }}
          >
            <DropDown
              args={this.props.args}
              mainList={"account"}
              selectedItem={{
                id: "111",
                name: "Switch Account"
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
