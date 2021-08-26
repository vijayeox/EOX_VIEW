import {
  React,
  Notification,
  Moment,
  countryStateList,
  KendoReactWindow,
  KendoReactInput
} from "oxziongui";
import PhoneInput from "react-phone-number-input";
// import TextareaAutosize from "react-textarea-autosize";
import 'react-phone-number-input/style.css';
import { GetSingleEntityData, PushDataPOST } from "../components/apiCalls";
import { SaveCancel, DropDown, CurrencySelect, FileUploader } from "../components/index";
import scrollIntoView from "scroll-into-view-if-needed";
import Swal from "sweetalert2";

export default class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.url = this.core.config("wrapper.url");
    let countryList = countryStateList.map((item) => item.country);
    this.state = {
      orgInEdit: this.props.dataItem || null,
      contactName: null,
      timeZoneValue: undefined,
      timezoneList: Moment.tz.names(),
      countryList: countryList
    };
    this.countryByIP = undefined;
    this.fUpload = {};
    this.notif = React.createRef();
    this.onContactPhoneChange = this.onContactPhoneChange.bind(this);
    this.imageExists = this.props.dataItem.logo ? true : false;
  }

  UNSAFE_componentWillMount() {
    if (this.props.formAction == "put") {
      this.setState({
        timeZoneValue: (this.state.orgInEdit.preferences) ? this.state.orgInEdit.preferences.timezone : undefined
      });

      GetSingleEntityData(
        "account/" +
          this.props.dataItem.uuid +
          "/user/" +
          this.props.dataItem.contactid +
          "/profile"
      ).then((response) => {
        this.setState({
          contactName: {
            id: "111",
            name: response.data.name
          }
        });
      });
    } else {
      getCountryByIP().then((data) => (this.countryByIP = data.country));
    }
  }

  onDialogInputChange = (event) => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.orgInEdit;
    edited[name] = value;

    this.setState({
      orgInEdit: edited
    });
  };

  onContactIPChange = (event) => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.orgInEdit;
    edited["contact"] = edited["contact"] ? edited["contact"] : {};
    edited["contact"][name] = value;

    this.setState({
      orgInEdit: edited
    });
  };

  onContactPhoneChange = (fullNumber) => {
    let orgInEdit = { ...this.state.orgInEdit };
    orgInEdit["contact"] = orgInEdit["contact"] ? orgInEdit["contact"] : {};
    orgInEdit["contact"]["phone"] = fullNumber;
    this.setState({ orgInEdit: orgInEdit });
  };

  dropdownChange = (field, event) => {
    let orgInEdit = { ...this.state.orgInEdit };
    orgInEdit[field] = event.target.value;
    this.setState({ orgInEdit: orgInEdit });
    if (field == "contactid") {
      this.setState({ contactName: event.target.value });
    }
  };

  valueChange = (field, event) => {
    if (field == "timezone") {
      this.setState({
        timeZoneValue: event
      });
      let orgInEdit = { ...this.state.orgInEdit };
      orgInEdit["preferences"] = orgInEdit["preferences"]
        ? orgInEdit["preferences"]
        : {};
      orgInEdit["preferences"][field] = event;
      this.setState({ orgInEdit: orgInEdit });
      } else {
      let orgInEdit = { ...this.state.orgInEdit };
      orgInEdit["preferences"] = orgInEdit["preferences"]
        ? orgInEdit["preferences"]
        : {};
      orgInEdit["preferences"][field] = event;
      this.setState({ orgInEdit: orgInEdit });
    }
  };

  validateEmail(emailText) {
    var pattern = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    if (!pattern.test(emailText)) {
      this.notif.current.notify(
        "Invalid Email ID",
        "Please enter a valid email address.",
        "warning"
      );
      return true;
    }
  }

  activateAccount(tempData) {
    Swal.fire({
      title: "Account already exists",
      text: "Do you want to reactivate the Account?",
      imageUrl: "apps/Admin/091-email-1.svg",
      imageWidth: 75,
      imageHeight: 75,
      confirmButtonText: "Reactivate",
      confirmButtonColor: "#d33",
      showCancelButton: true,
      cancelButtonColor: "#66bb6a",
      target: ".Window_Admin"
    }).then((result) => {
      if (result.value) {
        tempData.reactivate = "1";
        PushDataPOST(
          "account",
          this.props.formAction,
          this.state.orgInEdit.uuid,
          tempData
        ).then((response) => {
          if (response.status == "success") {
            this.props.action(response);
            this.props.cancel();
          } else {
            this.notif.current.notify(
              "Error",
              response.message ? response.message : null,
              "danger"
            );
          }
        });
      }
    });
  }

  pushData = () => {
    if (
      document.getElementById("select-currency").value !==
      this.state.orgInEdit.preferences.currency
    ) {
      this.notif.current.notify(
        "Invalid Currency",
        "Please choose a valid currency from the list.",
        "warning"
      );
      return;
    }
    if (this.props.formAction == "post") {
      if (
        this.validateEmail(
          document.getElementById("email-id").value
            ? document.getElementById("email-id").value
            : "dummydata@mail.com"
        )
      ) {
        return;
      }
    }

    this.notif.current.notify("Uploading Data", "Please wait for a few seconds.", "default" );
    var logoFile = undefined;
    if (this.props.formAction == "post") {
      var contactData = JSON.stringify({
        firstname: this.state.orgInEdit.contact.firstname,
        lastname: this.state.orgInEdit.contact.lastname,
        username: this.state.orgInEdit.contact.username,
        email: this.state.orgInEdit.contact.email,
        phone: this.state.orgInEdit.contact.phone
      });
      logoFile = this.fUpload.state.selectedFile[0].getRawFile();
    } else {
      var contactData = [];
      var contact_id = this.state.orgInEdit.contactid;
      logoFile = this.fUpload.state.selectedFile[0] ? this.fUpload.state.selectedFile[0].getRawFile() : undefined;
    }

    let tempData = {
      name: this.state.orgInEdit.name,
      address1: this.state.orgInEdit.address1,
      city: this.state.orgInEdit.city,
      state: this.state.orgInEdit.state,
      country: this.state.orgInEdit.country,
      zip: this.state.orgInEdit.zip,
      subdomain: this.state.orgInEdit.subdomain,
      logo: logoFile,
      contact: contactData,
      contactid: contact_id || null,
      preferences: JSON.stringify({
        dateformat: this.state.orgInEdit.preferences.dateformat,
        currency: this.state.orgInEdit.preferences.currency,
        timezone: this.state.orgInEdit.preferences.timezone.name
          ? this.state.orgInEdit.preferences.timezone.name
          : this.state.orgInEdit.preferences.timezone
      })
    };

    for (var i = 0; i <= Object.keys(tempData).length; i++) {
      let propertyName = Object.keys(tempData)[i];
      if (tempData[propertyName] == undefined) {
        delete tempData[propertyName];
      }
    }
    PushDataPOST(
      "account",
      this.props.formAction,
      this.state.orgInEdit.uuid,
      tempData
    ).then((response) => {
      if (response.status == "success") {
        this.props.action(response);
        this.props.cancel();
      } else if (
        response.message ==
        "Account already exists would you like to reactivate?"
      ) {
        this.activateAccount(tempData);
      } else {
        this.notif.current.notify(
          "Error",
          response.message ? response.message : null,
          "danger"
        );
      }
    });
  };

  sendData = (e) => {
    e.preventDefault();
    if (this.imageExists) {
      this.pushData();
    } else {
      if (this.fUpload.state.selectedFile.length == 0) {
        var elm = document.getElementsByClassName("orgFileUploader")[0];
        scrollIntoView(elm, {
          scrollMode: "if-needed",
          block: "center",
          behavior: "smooth",
          inline: "nearest"
        });
        this.notif.current.notify(
          "No image selected",
          "Please choose a logo for the Account.",
          "warning"
        );
      } else {
        this.pushData();
      }
    }
  };

  render() {
    if (typeof this.state.orgInEdit.contact == "undefined") {
      var contactValue = "";
    } else {
      var contactValue = this.state.orgInEdit.contact.phone
        ? this.state.orgInEdit.contact.phone
        : "";
    }
    return (
      <KendoReactWindow.Window onClose={this.props.cancel}>
        <Notification ref={this.notif} />
        <div className="container-fluid">
          <form id="orgForm" onSubmit={this.sendData}>
            {this.props.diableField ? (
              <div className="read-only-mode">
                <h5>(READ ONLY MODE)</h5>
                <i className="fa fa-lock"></i>
              </div>
            ) : null}
            <div className="form-group">
              <label className="required-label">Account Name</label>
              <KendoReactInput.Input
                type="text"
                className="form-control"
                value={this.state.orgInEdit.name || ""}
                name="name"
                onChange={this.onDialogInputChange}
                placeholder="Enter Account Name"
                maxLength="100"
                required={true}
                validationMessage={"Please enter a valid Account Name"}
                readOnly={this.props.diableField ? true : false}
              />
            </div>
            <div className="form-group text-area-custom">
              <label className="required-label">Address</label>
              <textarea
                type="text"
                className="form-control"
                value={this.state.orgInEdit.address1 || ""}
                name="address1"
                onChange={this.onDialogInputChange}
                placeholder="Enter Account Address"
                maxLength="250"
                style={{ marginTop: "5px" }}
                required={true}
                readOnly={this.props.diableField ? true : false}
              />
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col">
                  <label className="required-label">City</label>
                  <div>
                    <KendoReactInput.Input
                      type="text"
                      className="form-control"
                      value={this.state.orgInEdit.city || ""}
                      name="city"
                      onChange={this.onDialogInputChange}
                      placeholder="Enter City"
                      maxLength="50"
                      required={true}
                      validationMessage={"Please enter the city name."}
                      readOnly={this.props.diableField ? true : false}
                    />
                  </div>
                </div>
                <div className="col">
                  <label className="required-label">State</label>
                  <div>
                    <KendoReactInput.Input
                      type="text"
                      className="form-control"
                      value={this.state.orgInEdit.state || ""}
                      name="state"
                      onChange={this.onDialogInputChange}
                      placeholder="Enter State"
                      maxLength="50"
                      required={true}
                      validationMessage={"Please enter the state name."}
                      readOnly={this.props.diableField ? true : false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col">
                  <label className="required-label">Zip Code</label>
                  <KendoReactInput.Input
                    type="text"
                    className="form-control"
                    value={this.state.orgInEdit.zip || ""}
                    name="zip"
                    pattern="[0-9]+"
                    maxLength="6"
                    onChange={this.onDialogInputChange}
                    placeholder="Enter Zip Code"
                    required={true}
                    validationMessage={"Please enter a valid Zip Code."}
                    readOnly={this.props.diableField ? true : false}
                  />
                </div>
                <div className="col">
                  <label className="required-label">Country</label>
                  <div>
                    <DropDown
                      args={this.core}
                      rawData={this.state.countryList}
                      selectedItem={this.state.orgInEdit.country}
                      onDataChange={(e) => this.dropdownChange("country", e)}
                      required={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {this.props.formAction == "put" ? (
              <div className="form-group">
                <div className="form-row">
                  <div className="col">
                    <label className="required-label">
                      Account Contact Person (Admin)
                    </label>
                    <div>
                      <DropDown
                        args={this.core}
                        mainList={
                          "account/" +
                          this.props.dataItem.uuid +
                          "/adminusers"
                        }
                        preFetch={true}
                        selectedItem={this.state.contactName}
                        onDataChange={(e) =>
                          this.dropdownChange("contactid", e)
                        }
                        required={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="form-group text-area-custom">
              <label>Subdomain</label>
              <textarea
                type="text"
                className="form-control"
                value={this.state.orgInEdit.subdomain || ""}
                name="subdomain"
                onChange={this.onDialogInputChange}
                placeholder="Enter Account Subdomain"
                maxLength="250"
                style={{ marginTop: "5px" }}
                readOnly={this.props.diableField ? true : false}
              />
            </div>

            {this.props.formAction == "post" ? (
              <div className="form-group border-box">
                <label className="required-label">Contact Details</label>
                <div className="form-row">
                  <div className="col">
                    <KendoReactInput.Input
                      className="form-control"
                      type="text"
                      name="firstname"
                      value={
                        this.state.orgInEdit.contact
                          ? this.state.orgInEdit.contact.firstname
                          : ""
                      }
                      maxLength="50"
                      onChange={this.onContactIPChange}
                      placeholder="Enter First Name"
                      required={true}
                      validationMessage={"Please enter the First Name."}
                    />
                  </div>
                  <div className="col">
                    <KendoReactInput.Input
                      className="form-control"
                      type="text"
                      name="lastname"
                      value={
                        this.state.orgInEdit.contact
                          ? this.state.orgInEdit.contact.lastname
                          : ""
                      }
                      maxLength="50"
                      onChange={this.onContactIPChange}
                      placeholder="Enter Last Name"
                      required={true}
                      validationMessage={"Please enter the Last Name."}
                    />
                  </div>
                </div>
                <div className="form-row" style={{ marginTop: "10px" }}>
                  <div className="col">
                    <KendoReactInput.Input
                      className="form-control"
                      type="text"
                      name="username"
                      value={
                        this.state.orgInEdit.contact
                          ? this.state.orgInEdit.contact.username
                          : ""
                      }
                      maxLength="25"
                      onChange={this.onContactIPChange}
                      placeholder="Enter User Name"
                      required={true}
                      validationMessage={"Please enter the First Name."}
                    />
                  </div>
                </div>
                <div className="form-row" style={{ marginTop: "10px" }}>
                  <div className="col">
                                    
                  </div>
                  <div className="col">
                    <KendoReactInput.Input
                      className="form-control"
                      type="email"
                      name="email"
                      id="email-id"
                      value={
                        this.state.orgInEdit.contact
                          ? this.state.orgInEdit.contact.email
                          : ""
                      }
                      maxLength="250"
                      onChange={this.onContactIPChange}
                      placeholder="Enter Email ID"
                      required={true}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="form-group border-box">
              <label className="required-label">Account Preferences</label>
              <div className="form-row pt-3 pb-3">
                <div className="col">
                  <label className="required-label">Currency</label>
                  <CurrencySelect
                    id={"select-currency"}
                    name={"currency"}
                    onChange={(e) =>
                      this.valueChange("currency", e.target.value)
                    }
                    value={
                      this.state.orgInEdit.preferences
                        ? this.state.orgInEdit.preferences.currency
                        : ""
                    }
                    readOnly={this.props.diableField ? true : false}
                  />
                </div>

                <div className="col" style={{ display: "flex" }}>
                  <label
                    style={{ position: "absolute" }}
                    className="required-label"
                  >
                    Date Format
                  </label>
                  <div
                    style={{
                      marginTop: "34px",
                      width: "inherit"
                    }}
                  >
                    <DropDown
                      args={this.core}
                      disableItem={this.props.diableField}
                      filterable={false}
                      rawData={[
                        "19-06-2019  (dd-MM-yyyy)",
                        "19-Jun-2019 (dd-MMM-yyyy)",
                        "2019-06-19  (yyyy-MM-dd)",
                        "06-19-2019  (MM-dd-yyyy)"
                      ]}
                      selectedItem={
                        this.state.orgInEdit.preferences
                          ? this.state.orgInEdit.preferences.dateformat
                          : ""
                      }
                      onDataChange={(e) => {
                        var start = e.target.value.indexOf("(") + 1;
                        var end = e.target.value.indexOf(")");
                        this.valueChange(
                          "dateformat",
                          e.target.value.slice(start, end)
                        );
                      }}
                      required={true}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row" style={{ marginTop: "5px" }}>
                <div className="col timeZonePicker">
                  <label className="required-label">Timezone</label>
                  <div>
                    <DropDown
                      args={this.core}
                      rawData={this.state.timezoneList}
                      selectedItem={this.state.timeZoneValue}
                      onDataChange={(e) =>
                        this.valueChange("timezone", e.target.value)
                      }
                      filterable={true}
                      required={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {this.props.diableField ? (
              <div style={{ margin: "50px" }} />
            ) : (
              <div className="orgFileUploader">
                <FileUploader
                  tempref={e => this.fUpload = e}
                  required={true}
                  media_type={"image"}
                  enableVideo={false}
                  acceptFileTypes={"image/*"}
                  media_URL={this.props.dataItem.logo}
                  title={"Upload Account Logo"}
                  uploadID={"organizationLogo"}
                />
              </div>
            )}
          </form>
        </div>
        <SaveCancel
          save="orgForm"
          cancel={this.props.cancel}
          hideSave={this.props.diableField}
        />
      </KendoReactWindow.Window>
    );
  }
}

async function getCountryByIP() {
  let response = await fetch(`https://get.geojs.io/v1/ip/country.json`);
  let data = await response.json();
  return data;
}
