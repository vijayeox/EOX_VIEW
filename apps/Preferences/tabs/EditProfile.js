import {
  React,
  Notification,
  AvatarImageCropper,
  ReactBootstrap,
  Webcam,
  countryStateList,
  FormRender
} from "oxziongui";
import editProfile from '../public/forms/editProfileForm.json'


class EditProfile extends React.Component {
  constructor(props) {
    super(props);

    this.core = this.props.args;
    var userprofile = this.getUserProfile();

    this.state = {
      showImageDiv: 1,
      imageData: null,
      icon: userprofile.key.icon + "?" + new Date(),
      reload: false,
      userprofile:userprofile
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.notif = React.createRef();
    this.submitProfilePic = this.submitProfilePic.bind(this);
  }

  componentDidMount(){
    var userprofile = this.getUserProfile();
    this.setState({icon: userprofile.key.icon + "?" + new Date(),userprofile:userprofile,profileReady:true});
  }
  componentWillMount() {
    this.setState({reload:false})
    
  }
  async handleSubmit(event) {
    
    this.core.make("oxzion/profile").update();
    var userprofile = this.getUserProfile();
    this.setState({reload: true,userprofile:userprofile})
      
  }

  getUserProfile(){
    var userprofile = this.core.make("oxzion/profile").get();
    if(userprofile && userprofile.key.phone){
      var phoneNumber = userprofile.key.phone;
      let i = phoneNumber.indexOf("-");
      userprofile.key.country_code = phoneNumber.slice(0,i).trim();
      userprofile.key.contact = phoneNumber.slice(i+1, phoneNumber.length).trim();

    }
    userprofile.key.phone = "";
    let countryList = countryStateList.map((item) => item.country);
    if (
      userprofile.key.preferences != undefined ||
      userprofile.key.preferences != null
    ) {
      userprofile.key.preferences["dateformat"] =
        userprofile.key.preferences["dateformat"] &&
        userprofile.key.preferences["dateformat"] != ""
          ? userprofile.key.preferences["dateformat"]
          : "DD-MM-YYYY";
    } else {
      userprofile.key.preferences = { dateformat: "DD-MM-YYYY" };
    }
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
      <div className="prefrencesMainDiv">
        {this.profileImageData()}
        {this.chooseImageData()}
        {this.chooseWebCamData()}
        <ReactBootstrap.Form className="edit-profile-form preferenceForm">
          <div className="componentDiv">
            <Notification ref={this.notif} />
            <div className="formmargin">
            <FormRender 
              content = {editProfile}
              userprofile = {this.state.userprofile}
              core ={this.core}
              route= {"/user/me/save"}
              postSubmitCallback = {this.handleSubmit}
              editProfile = {true}
              appConfig = {this.appConfig}
            />
            </div>
          </div>
        </ReactBootstrap.Form>
      </div>
    );
  }
}

export default EditProfile;
