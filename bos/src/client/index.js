/*!
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

//
// This is the client bootstrapping script.
// This is where you can register service providers or set up
// your libraries etc.
//
// https://manual.os-js.org/v3/guide/provider/
// https://manual.os-js.org/v3/install/
// https://manual.os-js.org/v3/resource/official/
//

import '@fortawesome/fontawesome-pro/css/fontawesome.min.css';

import {
  Core,
  CoreServiceProvider,
  DesktopServiceProvider,
  VFSServiceProvider,
  NotificationServiceProvider,
  SettingsServiceProvider,
  AuthServiceProvider
} from '../osjs-client/index.js';


import {PanelServiceProvider} from './packages/panels';
import GlobalLinkHandler from './packages/EOXApplication/GlobalLinkHandler.js';
import {GUIServiceProvider} from '../osjs-gui';
import {DialogServiceProvider} from '@osjs/dialogs';
import {WidgetServiceProvider} from '@osjs/widgets';
import * as config from './config.js';
import localConfig from './local.js';
import loginAdapter from './adapters/AuthAdapter.js';
import Login from './pages/Login.js';
import merge from 'deepmerge';
import { RestClientServiceProvider } from './adapters/RestClient.js'
import { ProfileServiceProvider } from './adapters/ProfileAdapter.js';
import { WebSocketAdapter } from './adapters/WebSocketAdapter.js';
import { SplashServiceProvider } from './adapters/SplashAdapter.js';
import {UserSessionServiceProvider} from './adapters/UserSessionAdapter.js';
import { BosAdapter } from './adapters/BosAdapter.js';
import { GlobalLinkAdapter } from "./adapters/GlobalLinkAdapter.js";
import {ScriptLoaderServiceProvider} from './adapters/ScriptLoader.js';
import { MessageServiceProvider } from "./adapters/MessageAdapter.js";
import { LoggerServiceProvider } from './adapters/Logger.js'
/*import {MyApiServiceProvider} from './testProvider.js';
import announcementWidget from './customWidget.js';
import customPanelItem from './customPanel.js'*/

const init = () => {
  let mergedConfig = merge(config, localConfig);
  const osjs = new Core(mergedConfig, {});

  // Register your service providers
  osjs.register(CoreServiceProvider);
  osjs.register(DesktopServiceProvider);
  osjs.register(VFSServiceProvider);
  osjs.register(NotificationServiceProvider);
  osjs.register(SettingsServiceProvider, {before: true});
  osjs.register(BosAdapter);
  osjs.register(GlobalLinkAdapter);
  osjs.register(AuthServiceProvider, {
    before: true,
    args:
      {
        adapter:  loginAdapter,
        login: (core,options) => new Login(core,options)
      }
  });
  osjs.register(PanelServiceProvider);
  osjs.register(DialogServiceProvider);
  osjs.register(GUIServiceProvider);
  osjs.register(RestClientServiceProvider,{before: true});
  osjs.register(ProfileServiceProvider,{before: true});
  osjs.register(SplashServiceProvider, {before: true});
  osjs.register(UserSessionServiceProvider, {before: true});
  osjs.register(WebSocketAdapter);
  osjs.register(ScriptLoaderServiceProvider,{before: true});
  osjs.register(MessageServiceProvider, { before: true });
  osjs.register(GlobalLinkHandler,{before: true});
  osjs.register(LoggerServiceProvider,{before: true});
  osjs.boot();
};

if(localConfig && localConfig.cloudflare && localConfig.cloudflare.enabled == true) {
  let cloudflareScript = document.createElement("script");
  let token = localConfig.cloudflare.token;
  cloudflareScript.setAttribute("src", "https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{\"token\":\""+token+"\"}'");
  cloudflareScript.setAttribute("async", "false");
  document.body.appendChild(cloudflareScript);
}

window.addEventListener('DOMContentLoaded', () => init());
