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

import {h} from 'hyperapp';
import PanelItem from '../panel-item';
const logoutIcon = require('../../../../assets/images/logout.png');

/**
 * Logout
 *
 * @desc Logout Panel Item
 */
export default class LogoutPanelItem extends PanelItem {

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
    const logout = async () => {
      await this.core.make('osjs/session').save();
      this.core.make('osjs/auth').logout();
    };
    const confirm = () => {
     const callbackValue = dialog => 'My value';
    const options = {
    buttons: ['ok', 'cancel'],
    window: {
      title: 'My Dialog',
      dimension: {width: 200, height: 200}
    },
    atttributes:{
      modal:true
    }};
    const proc = this.core.make('osjs/dialog', 'confirm', {
      title: "Confirm Log out",
      message: "Are you sure you want to logout ?",
      choices: ['ok', 'cancel']
    }, (btn, value) => {
      if (btn === 'yes') {
        logout();
      }
    });
  }
    return super.render('logout', [
      h('div', {
        onclick: confirm,
        className: 'osjs-panel-logout'
      }, [
        h('img', {
          src: logoutIcon,
          alt: 'Log Out',
          title:'Logout'
        })])
    ]);
  }
}
