import PanelItem from "../panel-item";
import { h, text } from "hyperapp";
import Swal from "sweetalert2";

export default class NotificationCenterPanel extends PanelItem {
  init() {
    if (this.inited) {
      return;
    }
    super.init(
      {
        count: 10,
        showPanel: false,
        selectedTab: "assignments",
        taskList: [],
        rygFocus: "R",
        rygCount: {
          red: 2,
          yellow: 15,
          green: 20,
        },
        expandItem: undefined,
      },
      {
        toggleNotificationPanel: this.toggleNotificationPanel,
        switchTab: this.switchTab,
        switchRygFocus: this.switchRygFocus,
        expandTaskItem: this.expandTaskItem,
        taskItemClick: this.taskItemClick,
      }
    );
    this.taskItemActions = [
      {
        name: "edit",
        icon: "fa-solid fa-pencil",
      },
      {
        name: "snooze",
        icon: "fa-solid fa-clock",
      },
      {
        name: "comment",
        icon: "fa-solid fa-comment",
      },
      {
        name: "delete",
        icon: "fa-solid fa-trash",
      },
    ];
  }

  destroy() {
    this.interval = clearInterval(this.interval);
    super.destroy();
  }

  toggleNotificationPanel = (state) => ({
    ...state,
    showPanel: !state.showPanel,
    count: state.count + 1,
    taskList:
      state.count > 10
        ? [
            { title: "Task 1 Sample Text ABC XYZ", app: "Task App" },
            { title: "Task 1 Sample Text ABC XYZ", app: "PTO" },
            { title: "Task 1 Sample Text ABC XYZ", app: "PTO" },
            { title: "Task 1 Sample Text ABC XYZ", app: "PTO" },
            { title: "Task 2 Sample Text ABC XYZ", app: "CRM" },
            { title: "Task 3 Sample Text ABC XYZ", app: "CarPort" },
            { title: "Task 3 Sample Text ABC XYZ", app: "CarPort" },
            { title: "Task 3 Sample Text ABC XYZ", app: "Dive Insurance" },
            { title: "Task 3 Sample Text ABC XYZ", app: "CarPort" },
            { title: "Task 3 Sample Text ABC XYZ", app: "CarPort" },
            { title: "Task 3 Sample Text ABC XYZ", app: "Dive Insurance" },
            { title: "Task 3 Sample Text ABC XYZ", app: "CarPort" },
            { title: "Task 3 Sample Text ABC XYZ", app: "CarPort" },
            { title: "Task 3 Sample Text ABC XYZ", app: "Dive Insurance" },
          ]
        : [],
  });

  switchTab = (data) => data;

  switchRygFocus = (data) => data;

  expandTaskItem = (data) => (state) => ({
    ...state,
    expandItem:
      data.expandItem == state.expandItem ? undefined : data.expandItem,
  });

  taskItemClick = (action) => async (state) => {
    switch (action) {
      case "edit":
        break;
      case "snooze":
        let { value: snoozeValue } = await Swal.fire({
          title: "After how many days would you want to like be reminded?",
          input: "select",
          inputOptions: {
            Days: {
              day1: "1",
              day2: "2",
            },
            Weeks: {
              week1: "1",
              week2: "2",
            },
            Months: {
              month1: "1",
              month2: "2",
            },
            custom: "Choose Date",
          },
          confirmButtonColor: "#275362",
          cancelButtonColor: "#7b7878",
          showCancelButton: true,
        });

        if (snoozeValue != "custom") {
          Swal.fire(`You will be reminded in: ${snoozeValue}`);
        } else {
          snoozeValue = await Swal.fire({
            title: "Select Date",
            html: '<input id="snooze-task-date" type="datetime-local">',
            focusConfirm: false,
            preConfirm: () => {
              return document.getElementById("snooze-task-date").value;
            },
            confirmButtonColor: "#275362",
            cancelButtonColor: "#7b7878",
          });
          Swal.fire(`You will be reminded on: ${snoozeValue.value}`);
        }
        break;
      case "comment":
        break;
      case "delete":
        Swal.fire({
          title: "Are you sure you want to delete the task?",
          position: "center",
          confirmButtonText: "Yes",
          showCancelButton: true,
          confirmButtonColor: "#275362",
          cancelButtonColor: "#7b7878",
        }).then((result) => {
          if (result.value) {
            // logout();
          }
        });
        break;

      default:
        break;
    }
  };

  render(state, actions) {
    let rygComponent = h("div", { className: "rygToggle-container" }, [
      h(
        "div",
        {
          className: "rygToggle-r" + (state.rygFocus == "R" ? " focus" : ""),
          onclick: () => actions.switchRygFocus({ rygFocus: "R" }),
        },
        state.rygCount.red
      ),
      h(
        "div",
        {
          className: "rygToggle-y" + (state.rygFocus == "Y" ? " focus" : ""),
          onclick: () => actions.switchRygFocus({ rygFocus: "Y" }),
        },
        state.rygCount.yellow
      ),
      h(
        "div",
        {
          className: "rygToggle-g" + (state.rygFocus == "G" ? " focus" : ""),
          onclick: () => actions.switchRygFocus({ rygFocus: "G" }),
        },
        state.rygCount.green
      ),
    ]);

    return super.render("notificationCenter", [
      h(
        "div",
        {
          className: "osjs-panel-notificationCenter",
          onclick: () => actions.toggleNotificationPanel(state),
        },
        "NOTIFICATIONS",
        [
          h("i", {
            className: "fa-solid fa-bell",
          }),
          h("div", {
            className: "notificationCenter-badge",
            innerHTML: state.count,
          }),
        ]
      ),
      state.showPanel
        ? h(
            "div",
            {
              className: "notificationCenter-panel",
            },
            h(
              "div",
              {
                className: "tab-container",
              },
              [
                h(
                  "div",
                  {
                    onclick: () =>
                      actions.switchTab({ selectedTab: "assignments" }),
                    className:
                      "tab-assignments" +
                      (state.selectedTab == "assignments" ? " selected" : ""),
                  },
                  "Assignments",
                  state.selectedTab == "assignments" ? rygComponent : null
                ),
                h(
                  "div",
                  {
                    onclick: () =>
                      actions.switchTab({ selectedTab: "followups" }),

                    className:
                      "tab-followups" +
                      (state.selectedTab == "followups" ? " selected" : ""),
                  },
                  "Followups",
                  state.selectedTab == "followups" ? rygComponent : null
                ),
              ]
            ),
            state.taskList.length > 0
              ? [
                  h(
                    "div",
                    { className: "task-list" },
                    state.taskList.map((task, index) =>
                      h(
                        "div",
                        {
                          className: "task-item",
                          onclick: () =>
                            actions.expandTaskItem({ expandItem: index }),
                        },
                        [
                          h(
                            "div",
                            {
                              style: "width:100%; cursor:pointer",
                            },
                            [
                              h("div", { className: "title" }, task.title),
                              h("div", { className: "app" }, task.app),
                              state.expandItem == index
                                ? h("div", { className: "task-item-actions" }, [
                                    this.taskItemActions.map((action) =>
                                      h("i", {
                                        className: action.icon,
                                        name: action.name,
                                        onclick: () =>
                                          actions.taskItemClick(action.name),
                                      })
                                    ),
                                  ])
                                : null,
                            ]
                          ),
                          h("i", {
                            className:
                              "fa-solid fa-chevron-" +
                              (state.expandItem == index ? "up" : "down"),
                          }),
                        ]
                      )
                    )
                  ),
                ]
              : h("div", {
                  className: "tasks-completed",
                  innerHTML: "Nothing here. </br> You are all done for the day!",
                })
          )
        : null,
    ]);
  }
}
