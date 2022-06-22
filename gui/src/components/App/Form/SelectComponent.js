import Select from "formiojs/components/select/Select";
import * as _utils from "formiojs/utils/utils";
import * as _Formio from "formiojs/Formio";
import * as _lodash from "lodash";
import { Formio } from "formiojs";
import * as _nativePromiseOnly from "native-promise-only";

export default class SelectComponent extends Select {
  constructor(component, options, data) {
    var formOptions = Formio.getPlugin("optionsPlugin");
    var customOptions = _lodash.default.merge(options, formOptions.options);
    if (customOptions.core == null || customOptions.core == undefined) {
      console.log(customOptions);
    }
    super(component, customOptions, data);
    component.core = customOptions.core;
    component.uiUrl = customOptions.uiUrl;
    component.wrapperUrl = customOptions.wrapperUrl;
    component.appId = customOptions.appId;
    this.form = this.getRoot();
    this.cache = {};
  }

  loadItems(url, search, headers, options, method, body) {
    var _this3 = this;
    options = options || {}; // See if they have not met the minimum search requirements.

    var minSearch = parseInt(this.component.minSearch, 10);

    if (
      this.component.searchField &&
      minSearch > 0 &&
      (!search || search.length < minSearch)
    ) {
      // Set empty items.
      return this.setItems([]);
    } // Ensure we have a method and remove any body if method is get

    if(this.cache[`${this.component.key}-${search || ''}`]?.length > 0){
      return this.setItems(this.cache[`${this.component.key}-${search || ''}`])
    }

    method = method || "GET";

    if (method.toUpperCase() === "GET") {
      body = null;
    }
    var limit = this.component.limit || 100;
    var skip = this.isScrollLoading ? this.selectOptions.length : 0;
    var query =
      this.component.dataSrc === "url"
        ? {}
        : {
            limit: limit,
            skip: skip,
          }; // Allow for url interpolation.

    url = this.interpolate(url, {
      formioBase: this.component.wrapperUrl,
      search: search,
      limit: limit,
      skip: skip,
      page: Math.abs(Math.floor(skip / limit)),
    }); // Add search capability.

    if (this.component.searchField && search) {
      if (Array.isArray(search)) {
        query["".concat(this.component.searchField)] = search.join(",");
      } else {
        query["".concat(this.component.searchField)] = search;
      }
    } // If they wish to return only some fields.

    if (this.component.selectFields) {
      query.select = this.component.selectFields;
    } // Add sort capability

    if (this.component.sort) {
      query.sort = this.component.sort;
    }

    // if (!_lodash.default.isEmpty(query)) {
    //   // Add the query string.
    //   url += (!url.includes('?') ? '?' : '&') + _Formio.default.serialize(query, function (item) {
    //     return _this3.interpolate(item);
    //   });
    // } // Add filter capability

    if (this.component.filter) {
      url +=
        (!url.includes("?") ? "?" : "&") +
        this.interpolate(this.component.filter);
    } // Make the request.

    let dataState = {
      filter: {
        logic: "and",
        filters: [
          {
            field: this.component.searchField,
            operator: search ? "contains" : "isnotempty",
            value: search ?? "",
          },
        ],
      },
      sort: [{ dir: "asc", field: this.component.searchField }],
      take: limit,
      skip: skip,
    };
    let additionalFilters = headers.map;
    if(Object.keys(additionalFilters).length > 0){
      Object.keys(additionalFilters).map(item => {
        let value = this.form.data[item];
        if(value != "" && value != null && value != undefined){
          dataState.filter.filters.push({
            field: additionalFilters[item],
            operator: "contains",
            value: value,
          })
        }
      })
    
    }
    if(!url.includes("filter")){
      url += "?filter=[" + JSON.stringify(dataState) + "]";
    }
    console.log(url);

    options.header = headers;
    this.loading = true;
    var helper = _this3.component.core.make("oxzion/restClient");
    helper
      .request(
        "v1",
        _this3.component.properties["absoluteUrl"]
          ? url
          : "/app/" + _this3.component.appId + url,
        body,
        method
      )
      .then(function (response) {
        _this3.loading = false;
        if (response.status == "success") {
          _this3.cache[`${_this3.component.key}-${search || ''}`] = response.data;
          response.data
            ? _this3.setItems(response.data, !!search)
            : _this3.setItems(response, !!search);
        } else {
          _this3.setItems([]);
        }
      })
      .catch(function (err) {
        if (_this3.isInfiniteScrollProvided) {
          _this3.setItems([]);

          _this3.disableInfiniteScroll();
        }

        _this3.isScrollLoading = false;
        _this3.loading = false;

        _this3.itemsLoadedResolve();

        _this3.emit("componentError", {
          component: _this3.component,
          message: err.toString(),
        });

        console.warn("Unable to load resources for ".concat(_this3.key));
      });
  }
  render() {
    return super.render();
  }
  updateItems(searchInput, forceUpdate) {
    if (!this.component.data) {
      console.warn(
        `Select component ${this.key} does not have data configuration.`
      );
      this.itemsLoadedResolve();
      return;
    }

    // Only load the data if it is visible.
    if (!this.visible) {
      this.itemsLoadedResolve();
      return;
    }

    switch (this.component.dataSrc) {
      case "values":
        this.setItems(this.component.data.values);
        break;
      case "json":
        this.setItems(this.component.data.json);
        break;
      case "custom":
        this.updateCustomItems();
        break;
      case "resource": {
        // If there is no resource, or we are lazyLoading, wait until active.
        if (!this.component.data.resource || (!forceUpdate && !this.active)) {
          this.itemsLoadedResolve();
          return;
        }

        let resourceUrl = this.options.formio
          ? this.options.formio.formsUrl
          : `${Formio.getProjectUrl()}/form`;
        resourceUrl += `/${this.component.data.resource}/submission`;

        if (
          forceUpdate ||
          this.additionalResourcesAvailable ||
          !this.serverCount
        ) {
          try {
            this.loadItems(resourceUrl, searchInput, this.requestHeaders);
          } catch (err) {
            console.warn(`Unable to load resources for ${this.key}`);
          }
        } else {
          this.setItems(this.downloadedResources);
        }
        break;
      }
      case "url": {
        if (!forceUpdate && !this.active && !this.calculatedValue) {
          // If we are lazyLoading, wait until activated.
          this.itemsLoadedResolve();
          return;
        }
        var url = this.component.data.url;
        let method;
        let body;

        if (!this.component.data.method) {
          method = "GET";
        } else {
          method = this.component.data.method;
          if (method.toUpperCase() === "POST") {
            body = this.component.data.body;
          } else {
            body = null;
          }
        }
        const options = this.component.authenticate ? {} : { noToken: true };
        this.loadItems(
          url,
          searchInput,
          this.requestHeaders,
          options,
          method,
          body
        );
        break;
      }
      case "indexeddb": {
        if (typeof window === "undefined") {
          return;
        }

        if (!window.indexedDB) {
          window.alert(
            "Your browser doesn't support current version of indexedDB"
          );
        }

        if (
          this.component.indexeddb &&
          this.component.indexeddb.database &&
          this.component.indexeddb.table
        ) {
          const request = window.indexedDB.open(
            this.component.indexeddb.database
          );

          request.onupgradeneeded = (event) => {
            if (this.component.customOptions) {
              const db = event.target.result;
              const objectStore = db.createObjectStore(
                this.component.indexeddb.table,
                { keyPath: "myKey", autoIncrement: true }
              );
              objectStore.transaction.oncomplete = () => {
                const transaction = db.transaction(
                  this.component.indexeddb.table,
                  "readwrite"
                );
                this.component.customOptions.forEach((item) => {
                  transaction
                    .objectStore(this.component.indexeddb.table)
                    .put(item);
                });
              };
            }
          };

          request.onerror = () => {
            window.alert(request.errorCode);
          };

          request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(
              this.component.indexeddb.table,
              "readwrite"
            );
            const objectStore = transaction.objectStore(
              this.component.indexeddb.table
            );
            new NativePromise((resolve) => {
              const responseItems = [];
              objectStore.getAll().onsuccess = (event) => {
                event.target.result.forEach((item) => {
                  responseItems.push(item);
                });
                resolve(responseItems);
              };
            }).then((items) => {
              if (!_.isEmpty(this.component.indexeddb.filter)) {
                items = _.filter(items, this.component.indexeddb.filter);
              }
              this.setItems(items);
            });
          };
        }
      }
    }
  }
}
