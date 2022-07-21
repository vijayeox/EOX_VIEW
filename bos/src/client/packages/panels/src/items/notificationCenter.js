import PanelItem from "../panel-item";
import { h, app } from "hyperapp";

export default class NotificationCenterPanel extends PanelItem {
  init() {
    if (this.inited) {
      return;
    }
    super.init(
      {
        count: 0,
        showPanel: false,
        taskList: [],
      },
      {
        toggleNotificationPanel: this.toggleNotificationPanel,
      }
    );
  }
  destroy() {
    this.interval = clearInterval(this.interval);
    super.destroy();
  }

  toggleNotificationPanel = (state) => ({
    ...state,
    showPanel: !state.showPanel,
    count: state.count + 1,
    taskList: state.count > 10 ? ["Task 1", "Task 2", "Task 3"] : [],
  });

  render(state, actions) {
    console.log(
      "🚀 ~ file: notificationCenter.js ~ line 21 ~ NotificationCenterPanel ~ render ~ state",
      state
    );
    return super.render("notificationCenter", [
      h(
        "div",
        {
          className: "osjs-panel-notificationCenter",
          onclick: () => actions.toggleNotificationPanel(state),
        },
        "NOTIFICATIONS",
        [
          h("img", {
            src: "https://i.imgur.com/QNmZTiz.png",
          }),
        ],
        h("div", {
          className: "notificationCenter-badge",
          innerHTML: state.count,
        })
      ),
      state.showPanel
        ? h(
            "div",
            {
              className: "notificationCenter-panel",
            },
            state.taskList.length > 0
              ? [
                  h(
                    "ul",
                    {},
                    state.taskList.map((task) => h("li", { innerHTML: task }))
                  ),
                ]
              : h("div", {
                  className: "tasks-completed",
                  innerHTML: "All done for the day! ",
                })
          )
        : null,
    ]);
  }
}
