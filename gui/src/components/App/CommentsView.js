import { Button } from "@progress/kendo-react-buttons";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import moment from "moment";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import Swal from "sweetalert2";
import ActivityLog from "./ActivityLog";
import CommentsAttachments from "./CommentsAttachments";
import emojisData from "./Emoji.json";
import FileAttachment from "./FileAttachment";
import "./Styles/commentsView.scss";
import defaultStyle from "./Styles/defaultMentionsStyle.js";
class CommentsView extends React.Component {
  static emojiToggleCallback;
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.profileAdapter = this.core.make("oxzion/profile");
    this.profile = this.profileAdapter.get().key;
    this.appId = this.props.appId;
    this.loader = this.core.make("oxzion/splash");
    this.userTimezone = this.profile.timezone
      ? this.profile.timezone
      : moment.tz.guess();
    this.userDateFormat = this.profile.preferences.dateformat
      ? this.profile.preferences.dateformat
      : "YYYY/MM/DD";
    this.currentUserId = this.profile.uuid;
    var fileId = this.props.url ? this.props.url : null;
    fileId = this.props.fileId ? this.props.fileId : fileId;
    this.state = {
      showEmojiPicker: null,
      fileData: this.props.fileData,
      entityConfig: null,
      dataReady: this.props.url ? false : true,
      commentsList: {},
      entityId: null,
      mentionData: [],
      value: "",
      fileId: fileId,
      userList: [],
      emojis: [],
      showModal: false,
      imageDetails: {},
      showAuditLog: false,
      replyCommentToggle: null
    };
  }

  setReplyCommentToggle = (id) => {
    this.setState({ replyCommentToggle : id === this.state.replyCommentToggle ? null : id })
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.togglePicker.bind(this));
  }
  componentDidMount() {
    this.loader.show();
    this.getFileDetails(this.state.fileId).then((fileData) => {
      if (
        fileData.status == "success" &&
        fileData.data &&
        fileData.data.entity_id
      ) {
        var file = fileData.data.data ? fileData.data.data : fileData.data;
        this.setState({ entityId: fileData.data.entity_id, fileData: file });
        this.getEntityPage().then((entityPage) => {
          if (entityPage.data) {
            this.setState({ entityConfig: entityPage.data });
            this.generateViewButton(entityPage.data.enable_auditlog, fileData);
          }
          this.fetchCommentData();
        });
      }
    });
    this.setState({ emojis: emojisData });
    document.addEventListener("click", this.togglePicker.bind(this));
  }

  togglePicker(e) {
    try {
      if (e?.path?.find((p) => p?.id === "toggleEmojiButton")) return;
      CommentsView.emojiToggleCallback?.(e?.path?.find((p) => p?.id === "emoji-list"))
      // if (this.state.showEmojiPicker) {
      //   this.setState({
      //     showEmojiPicker: e?.path?.find((p) => p?.id === "emoji-list"),
      //   });
      // }
    } catch (err) {
      console.error(`togglePicker ${e}`);
    }
  }

  callAuditLog() {
    this.setState({ showAuditLog: true });
  }
  closeAuditLog = () => {
    this.setState({ showAuditLog: false });
  };

  async getComments() {
    let helper = this.core.make("oxzion/restClient");
    let fileContent = await helper.request(
      "v1",
      "file/" + this.state.fileId + "/getParentCommentslist",
      {},
      "get"
    );
    return fileContent;
  }

  async getData(api, term) {
    if (term) {
      var query = {
        filter: {
          logic: "and",
          filters: [{ field: "username", operator: "contains", value: term }],
        },
        skip: 0,
        take: 10,
      };
    } else {
      var query = { skip: 0, take: 20 };
    }
    let helper = this.core.make("oxzion/restClient");
    let response = await helper.request(
      "v1",
      "/" + api + "?" + "filter=[" + JSON.stringify(query) + "]",
      {},
      "get"
    );
    return response;
  }
  async getFileDetails(fileId) {
    let helper = this.core.make("oxzion/restClient");
    // let fileContent = await helper.request(
    //   "v1",
    //   "/app/" + this.appId + "/file/" + fileId + "/data",
    //   {},
    //   "get"
    // );
    // return fileContent;
    return helper.getMemoizedData(this.appId, 'FILE', "/app/" + this.appId + "/file/" + fileId + "/data");
  }
  async getEntityPage() {
    let helper = this.core.make("oxzion/restClient");
    let fileContent = await helper.request(
      "v1",
      "/app/" + this.appId + "/entity/" + this.state.entityId + "/page",
      {},
      "get"
    );
    return fileContent;
  }

  processResponse(response) {
    let res = {};
    let data = [],
      fileName = [];
    if (response.data.length > 0) {
      response.data.map((i, index) => {
        data.push({
          id: this.uuidv4(),
          text: i.text,
          name: i.name,
          time: i.time,
          user_id: i.userId,
          comment_id: i.commentId,
        });
        res["data"] = data;
        i?.attachments?.map((j) => {
          fileName.push(j.name);
          res["data"][index]["fileName"] = fileName;
        });
        fileName = [];
      });
      return this.formatFormData(res["data"]);
    } else {
      return [];
    }
  }

  fetchCommentData() {
    this.getComments().then((response) => {
      if (response.status == "success") {
        this.setState({
          commentsList: response.data ? this.processResponse(response) : {},
          dataReady: true,
        });
      }else{
        this.setState({
          commentsList: {},
          dataReady: true,
        });
      }
      this.loader.destroy();
    });
  }
  generateViewButton(enableAuditLog, fileData) {
    let gridToolbarContent = [];
    let filePage = [{ type: "EntityViewer", fileId: this.state.fileId }];
    let pageContent = {
      pageContent: filePage,
      title: "View",
      icon: "fa fa-eye",
      fileId: this.state.fileId,
    };
    gridToolbarContent.push(
      <Button
        title={"View"}
        className={"btn btn-primary"}
        primary={true}
        onClick={(e) => this.updatePageContent(pageContent)}
      >
        <i className={"fa fa-eye"}></i>
      </Button>
    );
    // }
    if (this.state.entityConfig && !this.state.entityConfig.has_workflow) {
      filePage = [
        {
          type: "Form",
          form_id: this.state.entityConfig.form_uuid,
          name: this.state.entityConfig.form_name,
          fileId: this.state.fileId,
        },
      ];
      let pageContent = {
        pageContent: filePage,
        title: "Edit",
        icon: "far fa-pencil",
      };
      gridToolbarContent.push(
        <Button
          title={"Edit"}
          className={"btn btn-primary"}
          primary={true}
          key={Math.random()}
          onClick={(e) => this.updatePageContent(pageContent)}
        >
          <i className={"fa fa-pencil"}></i>
        </Button>
      );
    }
    if (enableAuditLog) {
      gridToolbarContent.push(
        <Button
          title={"Audit Log"}
          className={"btn btn-primary"}
          primary={true}
          key={Math.random()}
          onClick={(e) => this.callAuditLog()}
        >
          <i className={"fa fa-history"}></i>
        </Button>
      );
    }
    let ev = new CustomEvent("addcustomActions", {
      detail: { customActions: gridToolbarContent, pageId : this.props.pageId },
      bubbles: true,
    });
    document.getElementById(this.appId + "_breadcrumbParent").dispatchEvent(ev);
  }
  getUserData = (query, callback) => {
    query &&
      this.getData("users/list", query).then((response) => {
        var tempUsers = response.data.map((user) => ({
          display: user.username,
          id: user.uuid,
          name: user.name,
        }));
        this.setState({ userList: tempUsers }, callback(tempUsers));
      });
  };

  queryEmojis = (query, callback) => {
    if (query.length < 2) return;

    const emojiObject = this.state.emojis;
    const matches = emojiObject.emojis.filter((emoji) => {
      return emoji.shortname.toLowerCase().indexOf(query.toLowerCase()) > -1;
    });
    return matches.map((emoji) => ({
      id: emoji.emoji,
      name: emoji.shortname,
    }));
  };

  bubbleEmoticonCheck(input) {
    const emojiObject = this.state.emojis;
    var regex = /\:(.*?)\:/g;
    var matched = String(input).match(regex);
    var emoticon;
    if (matched) {
      for (var i = 0; i < matched.length; i++) {
        const match = emojiObject.emojis
          .filter((emoji) => {
            return emoji.shortname
              .toLowerCase()
              .startsWith(matched[i].toLowerCase());
          })
          .slice(0, 1);
        if (Object.keys(match).length !== 0) {
          emoticon = match.map((mapped) => mapped.emoji);
          input = input.replace(matched[i], emoticon);
        }
      }
    }
    return input;
  }

  emojiCheck() {
    var regex =
      /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]|[\u200D])/g;
    var input = this.state.value;
    var matched = String(input).match(regex);
    if (matched) {
      for (var i = 0; i < matched.length; i++) {
        var j = this.emojiUnicode(matched[i]);
        input = input.replace(matched[i], j);
      }
      this.state.value = input;
    }
  }

  emojiUnicode(emoji) {
    if (emoji.length >= 1) {
      const pairs = [];
      for (var i = 0; i < emoji.length; i++) {
        if (emoji.charCodeAt(i) >= 0xd800 && emoji.charCodeAt(i) <= 0xdbff) {
          if (
            emoji.charCodeAt(i + 1) >= 0xdc00 &&
            emoji.charCodeAt(i + 1) <= 0xdfff
          ) {
            pairs.push(
              (emoji.charCodeAt(i) - 0xd800) * 0x400 +
                (emoji.charCodeAt(i + 1) - 0xdc00) +
                0x10000
            );
          }
        } else if (
          emoji.charCodeAt(i) < 0xd800 ||
          emoji.charCodeAt(i) > 0xdfff
        ) {
          pairs.push(emoji.charCodeAt(i));
        }
      }
      emoji = "";
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i] == "8205") {
          emoji += "&zwj;";
        } else {
          emoji += "&#" + pairs[i] + ";";
        }
      }
      return emoji;
    }
  }

  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  toggleEmojiPicker = () => {
    this.setState({ showEmojiPicker: !this.state.showEmojiPicker });
  };

  addEmoji = (emoji) => {
    const { newMessage } = this.state;
    const text = `${newMessage}${emoji.native}`;
    this.state.value = this.state.value + emoji.native;

    this.setState({
      newMessage: text,

      showEmojiPicker: false,
    });
  };

  async saveComments(data) {
    let helper = this.core.make("oxzion/restClient");
    let fileData = await helper.request(
      "v1",
      "file/" + this.state.fileId + "/comment",
      data,
      "post"
    );
    return fileData;
  }
  formatFormData(data) {
    var parsedData = [];
    for (var i = 0; i < data.length; i++) {
      try {
        parsedData[i] = data[i];
        parsedData[i]["text"] =
          typeof data[i]["text"] === "string"
            ? JSON.parse(data[i]["text"])
            : data[i]["text"] == undefined || data[i]["text"] == null
            ? ""
            : data[i]["text"];
        if (
          parsedData[i]["text"] == "" &&
          data[i]["text"] &&
          parsedData[key]["text"] != data[i]["text"]
        ) {
          parsedData[i]["text"] = data[i]["text"];
        }
        if (parsedData[key] == "[]" && data[i]["text"]) {
          parsedData[i]["text"] = [];
        }
      } catch (error) {
        if (data[i]["text"] != undefined) {
          parsedData[i]["text"] = data[i]["text"];
        }
      }
    }
    return parsedData;
  }

  saveComment(stepBack, comment) {
    this.loader.show();
    this.saveComments({ text: comment || this.state.value }).then(() => {
      this.setState({ mentionData: {}, value: "" });
      this.fetchCommentData();
    });
  }

  renderButtons(e, action) {
    var actionButtons = [];
    Object.keys(action).map(function (key, index) {
      actionButtons.push(
        <abbr title={action[key]} key={index}>
          <Button
            primary={true}
            className=" btn manage-btn k-grid-edit-command"
            onClick={() => this.buttonAction(action[key], e)}
            style={{ width: "auto" }}
          >
            <i className={"fa fa-trash-o manageIcons"}></i>
          </Button>
        </abbr>
      );
    }, this);
    return actionButtons;
  }

  buttonAction(action, rowData) {
    action == "Delete" ? this.deleteRecord(rowData) : null;
  }

  deleteRecord = (item) => {
    Swal.fire({
      title: "Would You Like To Delete the comment?",
      confirmButtonText: "Delete",
      confirmButtonColor: "#275362",
      showCancelButton: true,
      cancelButtonColor: "#7b7878",
      target: ".PageRender",
    }).then((result) => {
      if (result.value) {
        const commentsList = this.state.commentsList.slice();
        const index = commentsList.findIndex((p) => p.id === item.id);
        if (index !== -1) {
          commentsList.splice(index, 1);
          this.setState({ commentsList: commentsList }, () => {
            this.saveComment(false);
          });
        }
      }
    });
  };

  handleChange = (event, newValue, newPlainTextValue, mentions) => {
    if (newValue.length < 1000) {
      this.setState({
        value: newPlainTextValue,
        mentionData: { newValue, newPlainTextValue, mentions },
      });
    }
  };
  updatePageContent = (config) => {
    let eventDiv = document.getElementById("navigation_" + this.appId);
    let ev2 = new CustomEvent("addPage", {
      detail: config,
      bubbles: true,
    });
    eventDiv.dispatchEvent(ev2);
  };

  setModalShow(flag, imageDetails, index) {
    this.setState({
      showModal: flag,
      imageDetails: { data: imageDetails, index },
    });
  }
  // getDisableHeaderButtons(entityData) {
  // 	//disableHeaderButtons
  // 	try {
  // 		const disableCommentHeader = entityData?.content?.find((c) => c.type === 'TabSegment')?.content?.tabs?.map((tab) => tab)?.map((t) => t?.content?.find(c => c?.disableHeaderButtons))?.filter(v => v)?.length > 0 || ( !entityData?.enable_comments && this.appId == 'af6056c1-be46-4266-b83c-4b2177bcc7ca')
  // 		return disableCommentHeader;
  // 	} catch (e) {
  // 		console.error(`disableHeaderButtons `, e)
  // 		return false;
  // 	}
  // }
  render() {
    var that = this;
    if (this.state.dataReady) {
      return (
        <div className="commentsPage">
          {this.state.showAuditLog ? (
            <ActivityLog
              cancel={this.closeAuditLog}
              appId={this.appId}
              fileId={this.state.fileId}
              core={this.core}
            />
          ) : (
            <div>
              <FileAttachment
                show={this.state.showModal}
                onHide={() => this.setModalShow(false, null)}
                imageDetails={this.state.imageDetails}
              />
              {this.state.commentsList?.length > 0 &&
              <div id="chat-container">
                <div id="chat-message-list" key={this.state.fileId}>
                  <CommentList
                    comments={this.state.commentsList}
                    core={this.core}
                    fileId={this.state.fileId}
                    setReplyCommentToggle={this.setReplyCommentToggle}
                    replyCommentToggle={this.state.replyCommentToggle}
                  />
                </div>
              </div> || <div className="no-comments-found">No Comments Found</div>}
             <ReplyTextArea saveComment={this.saveComment.bind(this)} core={this.core} />
            </div>
          )}
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

export default CommentsView;

function ReplyTextArea({header, saveComment, core}){
  const emojiId = useMemo(() => `${Math.random()}`,[])
  function stateReducer(toggle, data){
    return {...toggle, ...data}
  }
  const [state, setState] = useReducer(stateReducer,{
    showEmojiPicker: null,
    entityConfig: null,
    commentsList: {},
    entityId: null,
    mentionData: [],
    value: "",
    userList: [],
    emojis: [],
    showModal: false,
    imageDetails: {},
    showAuditLog: false,
  })
  useEffect(() => {
    CommentsView.emojiToggleCallback = (showEmojiPicker) => setState({showEmojiPicker})
  },[])
  const getUserData = (query, callback) => {
    const splits = state.value.split(' ').filter(String);
    let isValid = splits.length > 1 || splits.length === 1 && splits[0].startsWith('@')
    isValid && query &&
      getData("users/list", query).then((response) => {
        var tempUsers = response.data.map((user) => ({
          display: user.username,
          id: user.uuid,
          name: user.name,
        }));
        setState({ userList: tempUsers }, callback(tempUsers));
      });
  };
  async function getData(api, term) {
    if (term) {
      var query = {
        filter: {
          logic: "and",
          filters: [{ field: "username", operator: "startswith", value: term }],
        },
        skip: 0,
        take: 10,
      };
    } else {
      var query = { skip: 0, take: 20 };
    }
    let helper = core.make("oxzion/restClient");
    let response = await helper.request(
      "v1",
      "/" + api + "?" + "filter=[" + JSON.stringify(query) + "]",
      {},
      "get"
    );
    return response;
  }
  function handleChange (event, newValue, newPlainTextValue, mentions) {
    if (newValue.length < 1000) {
      setState({
        value: newPlainTextValue,
        mentionData: { newValue, newPlainTextValue, mentions },
      });
    }
  };
  function emojiUnicode(emoji) {
    if (emoji.length >= 1) {
      const pairs = [];
      for (var i = 0; i < emoji.length; i++) {
        if (emoji.charCodeAt(i) >= 0xd800 && emoji.charCodeAt(i) <= 0xdbff) {
          if (
            emoji.charCodeAt(i + 1) >= 0xdc00 &&
            emoji.charCodeAt(i + 1) <= 0xdfff
          ) {
            pairs.push(
              (emoji.charCodeAt(i) - 0xd800) * 0x400 +
                (emoji.charCodeAt(i + 1) - 0xdc00) +
                0x10000
            );
          }
        } else if (
          emoji.charCodeAt(i) < 0xd800 ||
          emoji.charCodeAt(i) > 0xdfff
        ) {
          pairs.push(emoji.charCodeAt(i));
        }
      }
      emoji = "";
      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i] == "8205") {
          emoji += "&zwj;";
        } else {
          emoji += "&#" + pairs[i] + ";";
        }
      }
      return emoji;
    }
  }
  function emojiCheck() {
    var regex =
      /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]|[\u200D])/g;
    var input = state.value;
    var matched = String(input).match(regex);
    if (matched) {
      for (var i = 0; i < matched.length; i++) {
        var j = emojiUnicode(matched[i]);
        input = input.replace(matched[i], j);
      }
      state.value = input;
    }
  }
  function toggleEmojiPicker() {
    setState({ showEmojiPicker: !state.showEmojiPicker });
  }
  function queryEmojis (query, callback) {
    if (query.length < 2) return;

    const emojiObject = state.emojis;
    const matches = emojiObject.emojis.filter((emoji) => {
      return emoji.shortname.toLowerCase().indexOf(query.toLowerCase()) > -1;
    });
    return matches.map((emoji) => ({
      id: emoji.emoji,
      name: emoji.shortname,
    }));
  }
  function addEmoji (emoji) {
    const { newMessage } = state;
    const text = `${newMessage}${emoji.native}`;
    state.value = state.value + emoji.native;
    setState({
      newMessage: text,
      showEmojiPicker: false,
    });
  }
  return <> <div className="msger-inputarea">
    <h4>{header || 'Add a new comment'}</h4>
    <div className="flexCol commentBox">
      <MentionsInput
        value={state.value}
        onChange={handleChange}
        onKeyPress={(event) => {
          if (event.which === 13 && event.ctrlKey ) { // && event.ctrlKey  to submit the comment on clicking ctrl+enter
            emojiCheck();
            saveComment(false, state.value);
            setState({ value: '' })
          }
        }}
        markup="@{{__type__||__id__||__display__}}"
        placeholder="Type a comment here..."
        className="mentions"
        style={defaultStyle}
        allowSpaceInQuery={true}
        rows={10}
      >
        <Mention
          trigger={RegExp("(?:^|\\s)(@*([^@]*))$")}
          markup="@[__display__](user:__name__)"
          displayTransform={(id, username) => `@${username}` + " "}
          renderSuggestion={(
            suggestion,
            search,
            highlightedDisplay,
            index,
            focused
          ) => (
            <div className={`user ${focused ? "focused" : ""}`}>
              @{suggestion.display} - ({suggestion.name})
            </div>
          )}
          data={getUserData}
          className="mentions__mention"
          style={{ backgroundColor: "#cee4e5" }}
        />
        <Mention
          trigger=":"
          renderSuggestion={(
            suggestion,
            search,
            highlightedDisplay,
            index,
            focused
          ) => (
            <div className={`user ${focused ? "focused" : ""}`}>
              {suggestion.id} {suggestion.name}
            </div>
          )}
          data={queryEmojis}
          className="mentions__mention"
          style={{ backgroundColor: "#cee4e5" }}
        />
      </MentionsInput>
    </div>
    <div className="dash-manager-buttons">
      <div className="submissions">
        <button
          primary={true}
          disabled={state.value.length == 0 ? true : false}
          onClick={() => {
            emojiCheck();
            saveComment(false, state.value);
            setState({value : ''})
          }}
          className="post-comment"
        >
          Post Comment
        </button>
        <button
          className="k-button k-primary btn btn-primary"
          type="button"
          onClick={toggleEmojiPicker}
          id="toggleEmojiButton"
        >
          {/* <Smile /> */}
          <i class="fas fa-grin"></i>
        </button>
      </div>
      <div style={{ padding: "5px", fontSize: "12px" }}>
        {state.value.length + "/1000"}
      </div>
    </div>
  </div>
  {state.showEmojiPicker && <ul id="emoji-list"><Picker onSelect={addEmoji} /></ul>}</>
}

function CommentList({ comments, core, fileId, parentId, setReplyCommentToggle, replyCommentToggle}) {
  const [viewReply, setViewReply] = useState([]);
  const [repliesText, setRepliesText] = useState({})
  const [childComments,setChildComments] = useState(Array(comments.length).fill([]));
  const profileAdapter = core.make("oxzion/profile");
  const profile = profileAdapter.get().key;
  const loader = core.make("oxzion/splash");
  const userTimezone = profile.timezone ? profile.timezone : moment.tz.guess();
  const userDateFormat = profile.preferences.dateformat
    ? profile.preferences.dateformat
    : "YYYY/MM/DD";

  const bubbleEmoticonCheck = (input) => {
    // const emojiObject = this.state.emojis;
    var regex = /\:(.*?)\:/g;
    var matched = String(input).match(regex);
    var emoticon;
    if (matched) {
      for (var i = 0; i < matched.length; i++) {
        const match = emojisData.emojis
          .filter((emoji) => {
            return emoji.shortname
              .toLowerCase()
              .startsWith(matched[i].toLowerCase());
          })
          .slice(0, 1);
        if (Object.keys(match).length !== 0) {
          emoticon = match.map((mapped) => mapped.emoji);
          input = input.replace(matched[i], emoticon);
        }
      }
    }
    return input;
  };
  const toggleReplies = (id) => {
    const viewReplies = viewReply.slice()
    const idx = viewReply.findIndex(v => v === id);
    if(idx > -1){
      viewReplies.splice(idx,1);
    }else{
      viewReplies.push(id)
    }
    setViewReply(viewReplies)
  }
  const toggleReplyText = (id) => {
    if(!repliesText[id]?.toggle){
      setRepliesText({[id] :{ toggle : true, value : ''}})
      return;
    }
    setRepliesText({})
  }
  /*
  1
  1.1
  add comment in 1.1 -> 1.1.1
  reply to 1 -> 1.2
  refresh 1 children
  1.2 -> 1.1.1
  1.1 -> []
  */
  useEffect(() => {
    let helper = core.make("oxzion/restClient");
     Promise.all(comments.map(async ({comment_id}) => {
      const response = await helper.request("v1",`file/${fileId}/comment/${comment_id}/getchildlist`, {}, "get");
      return Promise.resolve(processResponse(response))
     })).then((childCommentsResponse) => {
      setChildComments(childCommentsResponse)
     })
  },[])
  function formatFormData(data) {
    var parsedData = [];
    for (var i = 0; i < data.length; i++) {
      try {
        parsedData[i] = data[i];
        parsedData[i]["text"] =
          typeof data[i]["text"] === "string"
            ? JSON.parse(data[i]["text"])
            : data[i]["text"] == undefined || data[i]["text"] == null
            ? ""
            : data[i]["text"];
        if (
          parsedData[i]["text"] == "" &&
          data[i]["text"] &&
          parsedData[key]["text"] != data[i]["text"]
        ) {
          parsedData[i]["text"] = data[i]["text"];
        }
        if (parsedData[key] == "[]" && data[i]["text"]) {
          parsedData[i]["text"] = [];
        }
      } catch (error) {
        if (data[i]["text"] != undefined) {
          parsedData[i]["text"] = data[i]["text"];
        }
      }
    }
    return parsedData;
  }
  function processResponse(response) {
    let res = {};
    let data = [],
      fileName = [];
    if (response.data.length > 0) {
      response.data.map((i, index) => {
        data.push({
          id: `${Math.random()}`,
          text: i.text,
          name: i.name,
          time: i.time,
          user_id: i.userId,
          comment_id: i.commentId,
        });
        res["data"] = data;
        i?.attachments?.map((j) => {
          fileName.push(j.name);
          res["data"][index]["fileName"] = fileName;
        });
        fileName = [];
      });
      return formatFormData(res["data"]);
    } else {
      return [];
    }
  }
  async function replyToComment(comment, item){
    const loader = core.make("oxzion/splash")
    try{
      loader.show()
      const cloneChildComments = [...childComments];
      let helper = core.make("oxzion/restClient");
      let {comment_id} = item
      const index = comments.findIndex(v => v.comment_id === comment_id);
      if(index > -1){
        await helper.request("v1",`file/${fileId}/comment`, { text : comment, parent: comments[index].comment_id }, "post")
        const response = await helper.request("v1",`file/${fileId}/comment/${comments[index].comment_id}/getchildlist`, {}, "get");
        cloneChildComments[index] = processResponse(response);
        setChildComments(cloneChildComments)
      }
      // setRepliesText({})
      setReplyCommentToggle(null)
      loader.destroy()
    }catch(e){
      loader.destroy()
    }
  }
  return (comments || []).slice(0).map((commentItem, commentIdx) => {
    const uniqueId = commentItem.comment_id;
    const isRepliesExpanded = viewReply.includes(uniqueId);
    commentItem.text = bubbleEmoticonCheck(commentItem.text);
    const isReplyText = repliesText[uniqueId]?.toggle;
    var image = core.config("wrapper.url") + "user/profile/" + commentItem.user_id;
    return (
      <div className="msg right-msg" key={uniqueId}>
        <div className="msg-bubble">
          <div
            className="msg-img"
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: "contain",
            }}
          ></div>
          <div className="msg-info">
            <div className="msg-info-extra">
              <div className="msg-info-name">{commentItem.name}</div>
              <div
                className="msg-text"
                dangerouslySetInnerHTML={{
                  __html: commentItem.text,
                }}
              ></div>
              <div className="display-flex flex-col gap-5">
                <div className="msg-info-time display-flex gap-5">
                  <div onClick={() => setReplyCommentToggle(uniqueId)}>Reply</div>
                  {moment
                    .utc(commentItem.time, "YYYY-MM-DD HH:mm:ss")
                    .clone()
                    .tz(userTimezone)
                    .format(`LLL`)}
                </div>
                {
                  replyCommentToggle === uniqueId && <div className="reply-comment">
                    <ReplyTextArea saveComment={(_, comment) => replyToComment(comment, commentItem)} core={core} />
                  </div>
                }
                {commentItem.fileName &&
                  commentItem.fileName.map((fileName, index) => {
                    return (
                      <CommentsAttachments
                        config={core.configuration}
                        restClient={core.make("oxzion/restClient")}
                        commentData={commentItem}
                        fileName={fileName}
                        index={index}
                      />
                    );
                  })}
              </div>
              {
                childComments[commentIdx]?.length > 0 &&
                <div className="comment-replies display-flex flex-col">
                <div className="reply-toggle gap-5" onClick={() => toggleReplies(uniqueId)}>
                  <div className="display-flex gap-5" >
                    <i class={"fas fa-arrow-circle-"+(isRepliesExpanded && 'down' || 'right')}></i>
                    <div>{isRepliesExpanded && 'Hide' || 'View'} {!isRepliesExpanded && childComments[commentIdx].length} Replies</div>
                  </div>
                </div>
                    { isRepliesExpanded &&
                    <CommentList
                      comments={childComments[commentIdx]}
                      core={core}
                      fileId={fileId}
                      parentId={uniqueId}
                      setReplyCommentToggle={setReplyCommentToggle}
                      replyCommentToggle={replyCommentToggle}
                    /> }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  });
}
