import {React,ReactDOM,  AvatarImageCropper,} from "oxziongui";
import ChangePassword from "./tabs/ChangePassword.js";
import Preferences from "./tabs/Preferences.js";
import EditProfile from "./tabs/EditProfile.js";
import { Tabs, TabLink, TabContent } from "react-tabs-redux";
import Profile from "./tabs/Profile";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.userprofile = this.core.make("oxzion/profile").get();
    console.log(this.userprofile.key);
    this.win = this.props.win;
    this.state = {
      fields: {},
      showImageDiv: 1,
      imageData: null,
      icon: this.userprofile.key.icon + "?" + new Date(),
      reload: false,
      profileData : this.userprofile.key
    };
    this.profile = {};
    this.mailTo = 'mailto:' + this.state.profileData.email;
    this.tel = 'tel:' + this.state.profileData.phone_number;
    this.submitProfilePic = this.submitProfilePic.bind(this);
    this.getProfile().then(response => {
      this.setState({ fields: response.data });
    });
  }
  
  async getProfile() {
    // call to api using wrapper
    let userprofile = await this.core.make("oxzion/profile").get();
    return userprofile;
  }


  async submitProfilePic(imageData) {
    const formData = {};
    formData["file"] = imageData;
    let helper = this.core.make("oxzion/restClient");
    let uploadresponse = await helper.request(
      "v1",
      "/user/profile",
      formData,
      "post"
    );
    if (uploadresponse.status == "error") {
      this.notif.current.notify(
        "Error",
        "Update failed: " + uploadresponse.message,
        "danger"
      );
    } else {
      this.setState({
        icon: imageData
      });
      this.core.make("oxzion/profile").update();
      this.notif.current.notify(
        "Success",
        "Profile picture updated successfully.",
        "success"
      );
    }
  }

  apply = (file) => {
    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = (reader) => {
        var base64Data = reader.target.result;
        this.submitProfilePic(base64Data);
        this.setState({
          showImageDiv: 1
        });
      };
    }
  };

  setRef = (webcam) => {
    this.webcam = webcam;
  };

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    this.setState({
      imageData: imageSrc
    });
  };
  chooseWebCamData = () => {
    if (this.state.showImageDiv == 3) {
      if (this.state.imageData == null) {
        const videoConstraints = {
          width: 200,
          height: 200,
          facingMode: "user"
        };
        return (
          <div className="chooseWebcamDiv">
            <Webcam
              audio={false}
              height={200}
              ref={this.setRef}
              screenshotFormat="image/jpeg"
              width={200}
              videoConstraints={videoConstraints}
              className="webCam"
              imageSmoothing={true}
            />
            <div>
              <p className="btn-sm btn-success imgBtn1" onClick={this.capture}>
                Capture
              </p>
              <p
                className="btn-sm btn-danger imgBtn1"
                onClick={() => {
                  this.setState({ showImageDiv: 1 });
                }}
              >
                Cancel
              </p>
            </div>
          </div>
        );
      } else {
        return (
          <div className="chooseWebcamDiv">
            <img src={this.state.imageData} className="webCamImage" />
            <p
              className="btn-sm btn-success imgBtn2"
              onClick={() => {
                this.submitProfilePic(this.state.imageData);
                this.setState({ showImageDiv: 1, imageData: null });
              }}
            >
              Apply
            </p>
            <p
              className="btn-sm btn-danger imgBtn2"
              onClick={() => {
                this.setState({ imageData: null });
              }}
            >
              Retake
            </p>
          </div>
        );
      }
    }
  };

  chooseImageData = () => {
    if (this.state.showImageDiv == 2) {
      return (
        <div className="chooseImageDiv">
          <AvatarImageCropper apply={this.apply} isBack={true} />
          <p
            className="btn-sm btn-danger imgBtn"
            onClick={() => {
              this.setState({ showImageDiv: 1 });
            }}
          >
            Cancel
          </p>
        </div>
      );
    }
  };

  profileImageData = () => {
    let displayImage, middle;
    if (this.state.icon == null || this.state.icon == "") {
      displayImage = {
        opacity: 0.5
      };
      middle = {
        opacity: 1
      };
    }
    if (this.state.showImageDiv == 1) {
      return (
        <div className="profileImageDiv">
          <div className="displayImage">
            <img
              src={this.state.icon}
              className="rounded-circle displayImage"
              style={displayImage}
            />
            <div className="middle" style={middle}>
              <div className="text">
                <p
                  className="btn-sm btn-success imgBtn"
                  onClick={() => {
                    this.setState({ showImageDiv: 2 });
                  }}
                >
                  Choose Image <i className="fa fa-image" />
                </p>
                <p
                  className="btn-sm btn-success imgBtn"
                  onClick={() => {
                    this.setState({ showImageDiv: 3 });
                  }}
                >
                  Take Picture <i className="fa fa-camera" />
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  
  render() {
    return (
      <div className="myProfileDiv row">
        <div className="col-md-3">
          <div className="portlet light profile-sidebar-portlet">
            <div className="profileImage">
              {this.profileImageData()}
              {this.chooseImageData()}
              {this.chooseWebCamData()}
            </div>
            <div className="profile-usertitle">
              <div className="profile-usertitle-name">
                {this.state.profileData.name}
              </div>
              <div className="profile-usertitle-job">
                {this.state.profileData.designation}
              </div>
            </div>
            <div className="profile-userbuttons">
              <a target="_blank" title="Website" className="btn btn-circle btn-icon-only purple profile-icons" href={this.state.profileData.website}>
                <i className="fa fa-globe"></i>
              </a>
              <a title="Mail User" href={this.mailTo} className="btn btn-circle btn-icon-only green profile-icons" target="_blank">
                <i className="fa fa-envelope"></i>
              </a>
            </div>
          <div className="portlet light">
            <div>
              <h4 className="profile-desc-title">
                About {this.state.profileData.name}
              </h4>
            </div>
            <div className="profile-desc-text">
              <p>
                {this.state.profileData.description}
              </p>
            <div className="margin-top-20 profile-desc-link">
              <i className="fa fa-envelope" title="Email"></i>
                {this.state.profileData.email}
            </div>
            <div className="margin-top-20 profile-desc-link">
              <i className="fa fa-phone" title="Phone"></i>
              <a href={this.tel} target="_blank">
                <span className="profile-desc-text">
                  {this.state.profileData.phone}
                </span>
              </a>
            </div>
          <div className="margin-top-20 profile-desc-link">
            <i className="fa fa-location-arrow" title="Address"></i>
            <span className="profile-desc-text">
              {this.state.profileData.address1} {this.state.profileData.address2}
            </span>
          </div>
          <div className="margin-top-20 profile-desc-link">
            <i className="fa fa-map-marker" title="Country"></i>
            <span className="profile-desc-text">
              {this.state.profileData.country}
            </span>
          </div>
          <div className="margin-top-20 profile-desc-link">
            <i className="fa fa-gift" title="Date Of Birth"></i>
            <span className="profile-desc-text">
              {this.state.profileData.date_of_birth}
            </span>
          </div>
          <div className="margin-top-20 profile-desc-link">
            <i className="fa fa-crosshairs" title="Interests"></i>
            <span className="profile-desc-text">
              {this.state.profileData.interest}
            </span>
          </div>
          <div className="margin-top-20 profile-desc-link">
            <i className="fa fa-user" title="Manager"></i>
            <span className="profile-desc-text">
              {this.state.profileData.manager_name}
            </span>
          </div>
        </div>
        </div>
        </div>
      </div>
      <div className="col-md-9">
        <Tabs name="tabs2" className="tabs" selectedTab="vertical-tab-editprofile">
          <div className="links">
            <TabLink to="vertical-tab-editprofile">
              <i className="fa fa-user-circle" />
              <span>
                Edit Profile
              </span>
            </TabLink>
            <TabLink to="vertical-tab-password">
              <i className="fa fa-key" />
              <span>
                Change Password
              </span>
            </TabLink>
            <TabLink to="vertical-tab-preferences">
              <i className="fa fa-key" />
                <span>
                  Preferences
                </span>
            </TabLink>
          </div>
          <div className="tabContentDiv">
            <TabContent for="vertical-tab-editprofile" key="vertical-tab-editprofile">
              <EditProfile args={this.core} />
            </TabContent>
            <TabContent for="vertical-tab-password" key="vertical-tab-password">
              <ChangePassword args={this.core}/>
            </TabContent>
            <TabContent for="vertical-tab-preferences" key="vertical-tab-preferences">
              <Preferences args={this.core} /> 
            </TabContent>
          </div>
        </Tabs>
      </div>
  </div>
);
}
}

export default App;
