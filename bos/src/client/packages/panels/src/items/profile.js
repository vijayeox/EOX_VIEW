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
    let profileDetails = this.core.make('oxzion/profile').get();
    let profileIcon = profileDetails['key'];

    const profile = () => {
      let profileElement = document.getElementById('profile');
      profileElement.classList.toggle('profile-visible');
      
      // console.log('test');
      // await this.core.make('osjs/session').save();
      // this.core.make('osjs/auth').profile();
    };
    return super.render('profile', [
      h('div', {
        onclick: profile,
        className: 'osjs-panel-profile'
      }, [
        h('img', {
          className:'profileicon',
          src: profileIcon['icon'],
          alt: 'Log Out'
        })])
    ]);
  }
}