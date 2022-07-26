/*
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2019, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */
import { h } from "hyperapp";
import PanelItem from "../panel-item";
import Swal from "sweetalert2";
// const logoutIcon = require("../../../../assets/images/logout.png");
// const profileIcon = require("../../../../assets/images/profile.png");
// const settingsIcon = require("../../../../assets/images/settings.png");
// const editIcon = require("../../../../assets/images/edit.svg").default;
// const edit_account = require("../../../../assets/images/Edit_account.svg").default;
// const Switch_account = require("../../../../assets/images/Switch_account.svg").default;
// const open_profile = require("../../../../assets/images/View_Profile.svg").default;
const edit_account = 'fas fa-user-edit';
const switch_account = 'fas fa-toggle-off';
const open_profile = 'fas fa-user-chart';


// const profileIcon = require('../../../../assets/images/profile_pic.png');
/**
 * Profile
 *
 * @desc Profile Panel Item
 */
export default class ProfilePanelItem extends PanelItem {
  init() {
    if (this.inited) {
      return;
    }
    super.init();
  }
  destroy() {
    this.interval = clearInterval(this.interval);
    super.destroy();
  }
  render(state, actions) {
    let profileDetails = this.core.make("oxzion/profile").get();
    profileDetails = profileDetails["key"];

    let profileAccounts = {};
    profileDetails.accounts.map((v) => {
      profileAccounts[v.accountId] = v.name;
    });
    const switchaccountPopup = () => {
      Swal.fire({
        title: "Select an Account",
        position: "top",
        showCancelButton: true,
        cancelButtonColor: "#7b7878",
        target: ".osjs-root",
        input: "select",
        inputOptions: profileAccounts,
        inputValue: profileDetails.accountId,
      }).then((result) => {
        if (result.value && result.value != profileDetails.accountId) {
          switchaccount(result.value);
        }
      });
    };
    const switchaccount = async (accountId) => {
      let helper = this.core.make("oxzion/restClient");
      let response = await helper.request(
        "v1",
        "user/switchaccount",
        { accountId: accountId },
        "post"
      );
      if (response.status == "success") {
        let user = this.core.getUser();
        user.jwt = response.data.jwt;
        this.core.setUser(user);
        // this.core.make("oxzion/restClient").handleRefresh();
        this.core.make("oxzion/profile").update();
        location.reload();
      } else {
        console.log(response.data.errors);
      }
    };
    const openProfile = () => {
      this.core.run("Preferences");
    };
    const openProfileApp = () => {
      this.core.run("Profile");
    };

    return super.render("profile", [
      h(
        "div",
        {
          className: "osjs-panel-profile",
        },
        [
          h(
            "div",
            {
              className: "profile-content",
            },
            [
              h(
                "div",
                {
                  className: "myprofile",
                },
                [
                  h(
                    "div",
                    {
                      className: "profile-dropdown-div",
                    },
                    [
                      h("img", {
                        src: profileDetails.icon + "?" + new Date(),
                        alt: "My Profile",
                        className: "profile-dropdown-image",
                        title: "My Profile",
                      }),
                      h(
                        "div",
                        {
                          className: "profile-dropdown-block",
                        },
                        [
                          h("div", {
                            title: profileDetails.name,
                            innerHTML: profileDetails.name,
                            className: "profile-dropdown-name",
                          }),
                          h("div", {
                            title: profileDetails.designation
                              ? profileDetails.designation
                              : "No designation provided",
                            innerHTML: profileDetails.designation
                              ? profileDetails.designation
                              : null,
                            className: "profile-dropdown-designation",
                          }),
                        ]
                      ),
                    ]
                  ),
                ]
              ),
              Object.keys(profileAccounts).length > 1
                ? h(
                  "a",
                  {
                    className: "profileitem",
                  },
                  [
                    h(
                      "div",
                      {
                        onclick: switchaccountPopup,
                        className: "profile-dropdown-item",
                      },
                      [
                        h("i", {
                          // src: Switch_account,
                          alt: "Switch Account",
                          className: switch_account,
                          title: "Switch Account",
                        }),
                        h("span", {
                          title: "Switch Account",
                          innerHTML: "Switch Account",
                          className: "profile-dropdown-text",
                        }),
                      ]
                    ),
                  ]
                )
                : null,
              h(
                "a",
                {
                  className: "profileitem",
                },
                [
                  h(
                    "div",
                    {
                      onclick: openProfile,
                      className: "profile-dropdown-item",
                    },
                    [
                      h("i", {
                        // src: edit_account,
                        alt: "Edit Profile",
                        className: edit_account,
                        title: "Edit Profile",
                      }),
                      h("span", {
                        title: "Edit Preference",
                        innerHTML: "Edit Preference",
                        className: "profile-dropdown-text",
                      }),
                    ]
                  ),
                ]
              ),
              // h(
              //   "a",
              //   {
              //     className: "profileitem",
              //   },
              //   [
              //     h(
              //       "div",
              //       {
              //         onclick: openProfileApp,
              //         className: "profile-dropdown-item",
              //       },
              //       [
              //         h("i", {
              //           // src: open_profile,
              //           alt: "Open Profile",
              //           className: open_profile,
              //           title: "Open Profile",
              //         }),
              //         h("span", {
              //           title: "Open Profile",
              //           innerHTML: "Open Profile",
              //           className: "profile-dropdown-text",
              //         }),
              //       ]
              //     ),
              //   ]
              // ),
            ]
          ),
          h("img", {
            className: "profileicon",
            src: profileDetails["icon"] + "?" + new Date().getTime(),
            alt: profileDetails["firstname"],
            title: "My Profile",
          }),

        ]
      ),
    ]);
  }
}
