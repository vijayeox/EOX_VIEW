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

import './index.scss';
import osjs from 'osjs';

import * as translations from './locales.js';

import {name as applicationName} from './metadata.json';

import {
  h,
  app
} from 'hyperapp';

import {
  Box,
  Button,
  TextField,
  Toolbar,
  Menubar,
  MenubarItem,
  Statusbar,
  Panes,
  listView
} from '@osjs/gui';

const getFileStatus = file => `${file.filename} (${file.size} bytes)`;

const getDirectoryStatus = (path, files) => {
  const directoryCount = files.filter(f => f.isDirectory).length;
  const fileCount = files.filter(f => !f.isDirectory).length;
  const totalSize = files.reduce((t, f) => t + (f.size || 0), 0);

  return `${directoryCount} directories, ${fileCount} files, ${totalSize} bytes total`;
};

const getMountpoints = core => core.make('osjs/fs').mountpoints(true).map(m => ({
  columns: [{
    icon: m.icon,
    label: m.label
  }],
  data: m
}));

const getMenuMountpoints = (core, cb) => core.make('osjs/fs').mountpoints(true).map(m => ({
  label: m.label,
  icon: m.icon,
  onclick: () => cb(m.root)
}));

const rename = (item, to) => {
  const idx = item.path.lastIndexOf(item.filename);
  return item.path.substr(0, idx) + to;
};

//
// Our main window view
//
const view = (bus, core, proc, win) => (state, actions) => {
  const FileView = listView.component(state.fileview, actions.fileview);
  const MountView = listView.component(state.mountview, actions.mountview);
  const {icon} = core.make('osjs/theme');
  const _ = core.make('osjs/locale').translate;

  return h(Box, {
    class: state.minimalistic ? 'osjs-filemanager-minimalistic' : ''
  }, [
    h(Menubar, {}, [
      h(MenubarItem, {
        onclick: ev => bus.emit('openMenu', ev, state, actions, {name: 'file'})
      }, _('LBL_FILE')),
      h(MenubarItem, {
        onclick: ev => bus.emit('openMenu', ev, state, actions, {name: 'view'})
      }, _('LBL_VIEW')),
      h(MenubarItem, {
        onclick: ev => bus.emit('openMenu', ev, state, actions, {name: 'go'})
      }, _('LBL_GO'))
    ]),
    h(Toolbar, {}, [
      h(Button, {
        title: _('LBL_BACK'),
        icon: icon('go-previous'),
        disabled: !state.history.length || state.historyIndex <= 0,
        onclick: () => actions.back()
      }),
      h(Button, {
        title: _('LBL_FORWARD'),
        icon: icon('go-next'),
        disabled: !state.history.length || (state.historyIndex === state.history.length - 1),
        onclick: () => actions.forward()
      }),
      h(Button, {
        title: _('LBL_HOME'),
        icon: icon('go-home'),
        onclick: () => bus.emit('goHome')
      }),
      h(TextField, {
        value: state.path,
        box: {
          grow: 1,
          shrink: 1
        },
        onenter: (ev, value) => bus.emit('openDirectory', {path: value}, 'clear')
      })
    ]),
    h(Panes, {style: {flex: '1 1'}}, [h(MountView), h(FileView)]),
    h(Statusbar, {}, [
      h('span', {}, state.status)
    ])
  ]);
};

//
// Our main window state and actions
//

const state = (bus, core, proc, win) => ({
  path: '',
  status: '',
  history: [],
  historyIndex: -1,
  minimalistic: false,

  mountview: listView.state({
    class: 'osjs-gui-fill',
    columns: ['Name'],
    hideColumns: true,
    rows: getMountpoints(core)
  }),

  fileview: listView.state({
    columns: [{
      label: 'Name',
      style: {
        minWidth: '20em'
      }
    }, {
      label: 'Type',
      style: {
        maxWidth: '150px'
      }
    }, {
      label: 'Size',
      style: {
        flex: '0 0 7em',
        textAlign: 'right'
      }
    }]
  })
});

const actions = (bus, core, proc, win) => ({
  addHistory: path => state => {
    const history = state.historyIndex === -1 ? [] : state.history;
    const lastHistory = history[history.length - 1];
    const historyIndex = lastHistory === path
      ? history.length - 1
      : history.push(path) - 1;

    return {history, historyIndex};
  },
  clearHistory: () => state => ({historyIndex: -1, history: []}),
  setMinimalistic: minimalistic => ({minimalistic}),
  setHistory: history => state => ({history}),
  setPath: path => state => ({path}),
  setStatus: status => state => ({status}),
  setFileList: ({path, rows}) => (state, actions) => {
    actions.fileview.setRows(rows);
    return {path};
  },

  mountview: listView.actions({
    select: ({data}) => bus.emit('selectMountpoint', data)
  }),

  fileview: listView.actions({
    select: ({data}) => bus.emit('selectFile', data),
    activate: ({data}) => bus.emit('readFile', data),
    created: ({el, data}) => {
      if (data.isFile) {
        core.make('osjs/dnd').draggable(el, {data});
      }
    },
    contextmenu: ({data, index, ev}) => bus.emit('openContextMenu', data, index, ev),
  }),

  back: () => state => {
    const index = Math.max(0, state.historyIndex - 1);
    bus.emit('openDirectory', state.history[index], true);
    return {historyIndex: index};
  },

  forward: () => state => {
    const index = Math.min(state.history.length - 1, state.historyIndex + 1);
    bus.emit('openDirectory', state.history[index], true);
    return {historyIndex: index};
  }
});

//
// Our dialog handler
//
const createDialog = (bus, core, proc, win) => (type, item, cb) => {
  cb = cb || function() {};

  const done = then => (btn, value) => {
    win.setState('loading', false);
    if (btn === 'ok' || btn === 'yes') {
      then(value);
    }
  };

  if (type === 'mkdir') {
    core.make('osjs/dialog', 'prompt', {
      message: `Create new directory`,
      value: 'New directory'
    }, done(value => {
      if (value) {
        const newPath = item.path.replace(/\/?$/, '/') + value;
        core.make('osjs/vfs')
          .mkdir({path: newPath})
          .then(() => cb());
      }
    }));
  } else if (type === 'rename') {
    core.make('osjs/dialog', 'prompt', {
      message: `Rename ${item.filename}`,
      value: item.filename
    }, done(value => {
      if (value) {
        const newPath = rename(item, value);
        core.make('osjs/vfs')
          .rename(item, {path: newPath})
          .then(() => cb());
      }
    }));
  } else if (type === 'delete') {
    core.make('osjs/dialog', 'confirm', {
      message: `Delete ${item.filename}`
    }, () => {
      core.make('osjs/vfs')
        .unlink(item)
        .then(() => cb());
    });
  } else if (type === 'error') {
    core.make('osjs/dialog', 'alert', {
      type: 'error',
      error: item.error,
      message: item.message
    }, done(() => {}));

    return;
  }

  win.setState('loading', true);
};

//
// Our application bootstrapper
//
const createApplication = (core, proc, win, $content) => {
  const homePath = {path: 'home:/'}; // FIXME
  let currentPath = proc.args.path ? Object.assign({}, homePath, proc.args.path) : homePath;
  const settings = { // FIXME
    showHiddenFiles: true
  };

  const title = core.make('osjs/locale')
    .translatableFlat(proc.metadata.title);

  const bus = core.make('osjs/event-handler', 'FileManager');
  const dialog = createDialog(bus, core, proc, win);
  const a = app(state(bus, core, proc, win),
    actions(bus, core, proc, win),
    view(bus, core, proc, win),
    $content);

  const getFileIcon = file => file.icon || core.make('osjs/fs').icon(file);
  const refresh = (currentFile) => bus.emit('openDirectory', currentPath, null, currentFile);

  const upload = f => {
    const uploadpath = currentPath.path.replace(/\/?$/, '/') + f.name;
    return core.make('osjs/vfs').writefile({path: uploadpath}, f);
  };

  bus.on('selectFile', file => a.setStatus(getFileStatus(file)));
  bus.on('selectMountpoint', mount => bus.emit('openDirectory', {path: mount.root}));

  bus.on('readFile', file => {
    if (file.isDirectory) {
      bus.emit('openDirectory', file);
    } else {
      core.open(file);
    }
  });

  bus.on('openDirectory', async (file, history, select) => {
    const {path} = file;

    win.setState('loading', true);
    const message = `Loading ${path}`;

    a.setStatus(message);
    win.setTitle(`${title} - ${message}`);

    let files;

    try {
      files = await core.make('osjs/vfs')
        .readdir(file, {
          showHiddenFiles: settings.showHiddenFiles
        });
    } catch (e) {
      console.warn(e);
      a.setPath(typeof currentPath === 'string' ? currentPath : currentPath.path);
      dialog('error', {error: e, message: 'Failed to open directory'});
      return;
    } finally {
      win.setState('loading', false);
    }

    const rows = files.map(f => ({
      columns: [{label: f.filename, icon: getFileIcon(f)}, f.mime, f.humanSize],
      data: f
    }));

    if (typeof history === 'undefined' || history === false) {
      a.addHistory(file);
    } else if (history ===  'clear') {
      a.clearHistory();
    }

    a.setFileList({path, rows});
    a.setStatus(getDirectoryStatus(path, files));

    if (select) {
      const foundIndex = files.findIndex(file => file.filename === select);
      if (foundIndex !== -1) {
        a.fileview.setSelectedIndex(foundIndex);
      }
    }

    win.setTitle(`${title} - ${path}`);

    currentPath = file;
    proc.args.path = file;
  });

  bus.on('openMenu', (ev, state, actions, item) => {
    const _ = core.make('osjs/locale').translate;
    const __ = core.make('osjs/locale').translatable(translations);

    const menus = {
      file: [
        {label: _('LBL_UPLOAD'), onclick: () => {
          const field = document.createElement('input');
          field.type = 'file';
          field.onchange = ev => {
            if (field.files.length) {
              upload(field.files[0])
                .then(() => refresh(field.files[0].name))
                .catch(error => dialog('error', {error, message: 'Failed to upload file(s)'}));
            }
          };
          field.click();
        }},
        {label: _('LBL_MKDIR'), onclick: () => dialog('mkdir', {path: currentPath.path}, () => refresh())},
        {label: _('LBL_QUIT'), onclick: () => proc.destroy()}
      ],

      view: [
        {label: _('LBL_REFRESH'), onclick: () => refresh()},
        {label: __('LBL_MINIMALISTIC'), checked: state.minimalistic, onclick: () => {
          actions.setMinimalistic(!state.minimalistic);
        }},
        {label: __('LBL_SHOW_HIDDEN_FILES'), checked: settings.showHiddenFiles, onclick: () => {
          settings.showHiddenFiles = !settings.showHiddenFiles;
          refresh();
        }}
      ],

      go: getMenuMountpoints(core, path => bus.emit('openDirectory', {path}))
    };

    core.make('osjs/contextmenu').show({
      menu: menus[item.name] || [],
      position: ev.target
    });
  });

  bus.on('openContextMenu', (item, index, ev) => {
    if (['..', '.'].indexOf(item.filename) !== -1) {
      return;
    }

    const _ = core.make('osjs/locale').translate;

    const menu = [
      item.isDirectory ? {
        label: _('LBL_GO'),
        onclick: () => bus.emit('readFile', item)
      } : {
        label: _('LBL_OPEN'),
        onclick: () => bus.emit('readFile', item)
      },
      {
        label: _('LBL_RENAME'),
        onclick: () => dialog('rename', item, () => refresh())
      },
      {
        label: _('LBL_DELETE'),
        onclick: () => dialog('delete', item, () => refresh())
      }
    ];

    if (!item.isDirectory) {
      menu.push({
        label: _('LBL_DOWNLOAD'),
        onclick: () => core.make('osjs/vfs').download(item)
      });
    }

    core.make('osjs/contextmenu').show({
      position: ev,
      menu
    });
  });

  win.on('drop', (ev, data, files) => {
    if (files.length) {
      Promise.all(files.map(upload))
        .then(() => refresh(files[0].name)) // FIXME: Select all ?
        .catch(error => dialog('error', {error, message: 'Failed to upload file(s)'}));
    }
  });

  bus.on('goHome', () => bus.emit('openDirectory', homePath, 'clear'));
  bus.emit('openDirectory', currentPath);
};

//
// Callback for launching application
//
osjs.register(applicationName, (core, args, options, metadata) => {
  const proc = core.make('osjs/application', {
    args,
    options,
    metadata
  });

  const title = core.make('osjs/locale')
    .translatableFlat(metadata.title);

  proc.createWindow({
    id: 'FileManager',
    title,
    icon: proc.resource(metadata.icon_white),
    dimension: {width: 400, height: 400},
    attributes: {
      mediaQueries: {
        small: 'screen and (max-width: 400px)'
      }
    }
  })
    .on('destroy', () => proc.destroy())
    .on('render', (win) => win.focus())
    .render(($content, win) => createApplication(core, proc, win, $content));

  return proc;
});
