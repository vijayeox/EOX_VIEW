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
import * as languages from "../locales";

// const menuIcon = require('../logo-white-32x32.png');
const menuIcon = require("../../../../assets/images/logo.png").default;
const defaultIcon = require("../../../../assets/images/oxfav.png");
const sortBy = (fn) => (a, b) => -(fn(a) < fn(b)) || +(fn(a) > fn(b));
const sortByLabel = (iter) => String(iter.label).toLowerCase();

const getIcon = (core, m) => (m.icon ? (m.icon.match(/^(https?:)\//) ? m.icon : core.url(m.icon, {}, m)) : defaultIcon);

const getTitle = (locale, item) => locale.translatableFlat(item.title, item.name);

const getCategory = (locale, cat) => locale.translate(cat);

const makeCategory = (category, core) => {
  let categoryDiv = document.createElement("div");
  categoryDiv.classList.add("category");
  let captionDiv = document.createElement("div");
  captionDiv.classList.add("caption");
  let dropdown = document.createElement("i");
  dropdown.classList.add("fas");
  dropdown.classList.add("fa-caret-down");
  dropdown.classList.add("dropdown-icon");
  dropdown.style.float = "right";
  dropdown.addEventListener("click", function (e) {
    if (!e.target.classList.contains("fa-rotate-270")) {
      e.target.classList.add("fa-rotate-270"); //to rotate the icon
      e.target.parentNode.parentNode.childNodes[1].style.display = "none";
    } else {
      e.target.classList.remove("fa-rotate-270");
      e.target.parentNode.parentNode.childNodes[1].style.display = "flex";
    }
  });
  let categoryLabel = document.createTextNode(category.label);
  captionDiv.append(categoryLabel);
  captionDiv.append(dropdown);
  categoryDiv.appendChild(captionDiv);
  categoryDiv = makeAppList(category, categoryDiv, core);
  return categoryDiv;
};

const makeAppList = (category, categoryDiv, core) => {
  if (category.items) {
    let appListDiv = document.createElement("div");
    appListDiv.classList.add("applist");
    for (let i = 0; i < category.items.length; i++) {
      const appItem = category.items[i];
      let appDiv = document.createElement("div");
      appDiv.classList.add("app");
      let captionDiv = document.createElement("div");
      let icon = document.createElement("i");
      let iconClassList = appItem.fontIcon.split(" ");
      icon.classList.add(iconClassList[0]);
      icon.classList.add(iconClassList[1]);
      captionDiv.classList.add("appcaption");
      let appLabel = document.createTextNode(appItem.label);
      captionDiv.append(appLabel);
      appDiv.appendChild(icon);
      appDiv.appendChild(captionDiv);
      appDiv.onclick = function () {
        core.run(appItem.data.name);
        document.getElementById("appmenu").classList.remove("appmenu-visible");
      };
      appListDiv.appendChild(appDiv);
    }
    categoryDiv.appendChild(appListDiv);
  }
  return categoryDiv;
};
const makeTree = (core, __, metadata) => {
  const configuredCategories = core.config("application.categories");
  const categories = {};
  const locale = core.make("osjs/locale");

  metadata
    .filter((m) => m.hidden !== true)
    .forEach((m) => {
      const cat = Object.keys(configuredCategories).find((c) => c === m.category) || "other";
      const found = configuredCategories[cat];

      if (!categories[cat]) {
        categories[cat] = {
          icon: found.icon ? { name: found.icon } : defaultIcon,
          label: getCategory(locale, found.label),
          items: [],
        };
      }

      categories[cat].items.push({
        icon: getIcon(core, m),
        label: getTitle(locale, m),
        fontIcon: m.fontIcon ? m.fontIcon : "fas fa-globe",
        data: {
          name: m.name,
        },
      });
    });

  Object.keys(categories).forEach((k) => {
    categories[k].items.sort(sortBy(sortByLabel));
  });

  const sorted = Object.values(categories);
  sorted.sort(sortBy(sortByLabel));

  return [...sorted];
};

/**
 * Menu
 *
 * @desc Menu Panel Item
 */
export default class MenuPanelItem extends PanelItem {
  attachKeybindings(el) {
    const onkeydown = (ev) => {
      const checkKeys = (this.options.boundKey || "Alt+a").toLowerCase().split("+");
      const modifierNames = ["ctrl", "shift", "alt", "meta"];
      const keyName = String(ev.key).toLowerCase();
      const validKeypress = checkKeys.every((k) => (modifierNames.indexOf(k) !== -1 ? ev[k + "Key"] : keyName === k));

      if (!validKeypress) {
        return;
      }

      el.click();
    };

    window.addEventListener("keydown", onkeydown);
    this.on("destroy", () => window.removeEventListener("keydown", onkeydown));
  }

  hideMenu() {
    const _ = this.core.make("osjs/locale").translate;
    const __ = this.core.make("osjs/locale").translatable(languages);
    const packages = this.core.make("osjs/packages").getPackages((m) => m.type && m.type === "application");
    let appArray = makeTree(this.core, __, [].concat(packages));
    return appArray.length == 0;
  }

  render(state, actions) {
    const _ = this.core.make("osjs/locale").translate;
    const __ = this.core.make("osjs/locale").translatable(languages);

    const addSearch = (searchDiv, input) => {
      let filter, items, i;
      filter = input.value.toUpperCase();
      const categories = [...document.querySelectorAll("#appmenu>.app-bar>.category")];
      for (let category of categories) {
        const appLists = [...category.children[1].children];
        let c = 0;
        for (let app of appLists) {
          const e = app.children[1];
          if (e.innerHTML.toLowerCase().includes(filter.toLowerCase())) {
            app.style.display = "flex";
          } else {
            c++;
            app.style.display = "none";
          }
        }
        category.style.display = c === appLists.length ? "none" : "block";
      }
    };

    const onclick = (ev) => {
      let packages = this.core.make("osjs/packages").getPackages((m) => m.type && m.type === "application");
      let appArray = makeTree(this.core, __, [].concat(packages));

      if (this.hideMenu()) {
        ev.preventDefault();
        return;
      }
      let appmenuElement = document.getElementById("appmenu");
      appmenuElement.innerHTML = "";
      let appBarDiv = document.createElement("div");
      appBarDiv.classList.add("app-bar");

      let searchDiv = document.createElement("div");
      searchDiv.classList.add("app-search-div");
      let searchBarDiv = document.createElement("div");
      searchBarDiv.classList.add("app-search-bar-div");

      let input = document.createElement("input");
      input.type = "text";
      input.name = "appsearch";
      input.id = "appsearch";
      input.classList.add("placeholder");
      input.placeholder = "Search Applications";
      let searchIcon = document.createElement("i");
      searchIcon.classList.add("fas");
      searchIcon.classList.add("fa-search");
      searchIcon.setAttribute("style", "margin-top: 14px;color: #275362;border-bottom: 1px solid;");
      // input.placeholder.style.color='#265160';
      input.onkeyup = function () {
        addSearch(searchDiv, input);
      };
      searchBarDiv.appendChild(input);
      searchBarDiv.appendChild(searchIcon);
      searchDiv.appendChild(searchBarDiv);
      appmenuElement.appendChild(searchDiv);

      // appmenuElement.classList.toggle('appmenu-visible');
      for (let category = 0; category < appArray.length; category++) {
        appBarDiv.appendChild(makeCategory(appArray[category], this.core));
      }
      appmenuElement.appendChild(appBarDiv);

      // this.core.make('osjs/contextmenu').show({
      //   menu: makeTree(this.core, __, [].concat(packages)),
      //   position: ev.target,
      //   callback: (item) => {
      //     const {name, action} = item.data || {};

      //     if (name) {
      //       this.core.run(name);
      //     } else if (action === 'saveAndLogOut') {
      //       logout(true);
      //     } else if (action === 'logOut') {
      //       logout(false);
      //     }
      //   }
      // });
    };

    var menu_name = this.hideMenu() ? "menu_hidden" : "menu";
    let profileDetails = this.core.make("oxzion/profile").get();
    let userAcountInfo = profileDetails["key"]["active_account"];
    return super.render(menu_name, [
      h(
        "div",
        {
          onclick,
          oncreate: (el) => this.attachKeybindings(el),
          className: "logo-here",
        },
        [
          h("img", {
            src: userAcountInfo?.preferences?.logo ? userAcountInfo?.preferences?.logo : menuIcon,
            alt: _("LBL_MENU"),
            title: menu_name == "menu" ? "Applications" : null,
          }),
        ]
      ),
    ]);
  }
}
