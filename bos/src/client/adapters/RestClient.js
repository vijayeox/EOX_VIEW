import { ServiceProvider } from '@osjs/common';
import LocalStorageAdapter from './localStorageAdapter.js';

export class RestClientServiceProvider extends ServiceProvider {

	constructor(core, options = {}) {
		super(core, options || {});
		this.core = core;
		this.token = null;
		this.baseUrl = this.core.config('wrapper.url');
		this.store = {}; // { [APP_ID] : { [DATA_NAME] : DATA } }
	}

	providers() {
		return [
			'oxzion/restClient'
		];
	}

	async init() {
		this.core.instance('oxzion/restClient', () => ({
			request: (version, action, params, method, headers, raw) => this.makeRequest(version, action, params, method, headers, raw),
			authenticate: (params) => this.authenticate(params),
			profile: () => this.profile(),
			handleRefresh: () => this.handleRefresh(),
			clearMemoizedData: (...args) => this.clearMemoizedData(...args),
			getMemoizedData: (...args) => this.getMemoizedData(...args),
		}));


	}
	// profile wrapper 
	profile() {
		let userData = this.core.getUser();
		this.token = userData["jwt"];
		try {
			let url = this.baseUrl + 'user/me/a+p+acc+bapp+ap';
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("GET", url, false);
			let auth = 'Bearer ' + this.token;
			xmlHttp.setRequestHeader("content-type", "application/json");
			xmlHttp.setRequestHeader("Authorization", auth);
			xmlHttp.send(null);
			return xmlHttp.responseText;
		}
		catch (e) { }
	}

	handleRefresh() {
		let user = this.core.getUser();
		let core = this.core;
		let refreshflag = false;
		var lsHelper = new LocalStorageAdapter;
		lsHelper.supported();
		if (user["jwt"] != null) {
			// console.log('refresh token to be called now...');
			const rtoken = lsHelper.get('REFRESH_token');
			// console.log(rtoken);
			let jwt = user["jwt"];
			let formData = new FormData();
			formData.append('jwt', jwt);
			formData.append('refresh_token', rtoken["key"])

			var xhr = new XMLHttpRequest();
			xhr.open('POST', this.baseUrl + 'refreshtoken', false);
			xhr.onload = function () {
				let data = JSON.parse(this.responseText);
				if (data["status"] == "success") {
					// console.log('refresh api called and token reset');
					jwt = data["data"]["jwt"];
					let refresh = data["data"]["refresh_token"];

					// console.log("user before update");
					// console.log(user);
					user["jwt"] = jwt;
					// console.log(user);
					core.setUser(user)
					lsHelper.set('AUTH_token', jwt);
					lsHelper.set('REFRESH_token', refresh);
					// console.log('true return now');
					refreshflag = true;
				} else {
					window.localStorage.clear();
					location.reload();
				}
			}
			xhr.send(formData);
		} else {
			window.localStorage.clear();
			location.reload();
		}
		return refreshflag;
	}

	// handles all request to OXZion apps
	// version - string
	// action - string
	// params - *
	// method - string
	async makeRequest(version, action, params, method, headers = null, raw = false) {
		this.messageBox = this.core.make("oxzion/messageDialog");
		let userData = this.core.getUser();
		if (action.charAt(0) == '/')
			action = action.substr(1);
		let urlString = this.baseUrl + action;
		this.token = userData["jwt"];
		let resp = 'null';
		let reqHeaders = {}
		method = method.toLowerCase();

		// adding custom headers if any along with auth
		if (headers != null) {
			let auth = 'Bearer ' + this.token;
			headers['Authorization'] = auth;
			reqHeaders = headers;
		}
		else if (headers == null) {
			let auth = 'Bearer ' + this.token;
			reqHeaders['Authorization'] = auth;
			if (method == 'get' || method == 'put') {
				if (!(reqHeaders['Content-Type'])) {
					reqHeaders['Content-Type'] = 'application/json';
				}
			}

		}
		try {
			if (method == 'get') {
				resp = await fetch(urlString, {
					method: method,
					credentials: 'include',
					headers: reqHeaders

				});
				if (resp.status == 400 && resp.statusText == 'Bad Request') {
					// fall through to refresh handling
				} else {
					if (raw == true || !(resp.headers.get("Content-Type").includes("json"))) {
						return resp;
					}
					return resp.json();
				}
			} else if (method == 'post' || method == 'put') {
				let parameters = params;
				if (typeof parameters === 'string') {
					parameters = JSON.parse(parameters)
				}
				resp = await fetch(urlString, {
					method: method,
					credentials: 'include',
					headers: reqHeaders,
					body: JSON.stringify(parameters)
				})

				if (resp.status == 400 && resp.statusText == 'Bad Request') {
					// fall through to refresh handling
				} else if ((resp.status >= 200 && resp.status < 300) ||resp.status == 412 ) {
					return resp.json();
				}else {
          // this.errorMessage(resp.statusText); // TODO - Resolve the promise and if there is a message send it else use statusText
          return resp.json();
          // fall through to refresh handling
        }
			}
			else if (method == 'filepost') {
				let parameters = params;
				let formData = new FormData();
				for (var k in parameters) {
					if (parameters[k] && parameters[k].name && parameters[k].body) {
						formData.append(k, parameters[k].body, parameters[k].name);
					} else {
						formData.append(k, parameters[k]);
					}
				}
				resp = await fetch(urlString,
					{
						body: formData,
						method: "post",
						credentials: 'include',
						headers: { "Authorization": "Bearer " + this.token }
					})
				if (resp.status == 400 && resp.statusText == 'Bad Request') {
					// fall through to refresh handling
				} else {
					return resp.json();
				}
			} else if (method == 'fileupload') {
				let formData = new FormData();
				formData.append('file', params.file);
				for (var k in params.data) {
					formData.append(k, params.data[k]);
				}
				resp = await fetch(urlString,
					{
						body: formData,
						method: "post",
						credentials: 'include',
						headers: { "Authorization": "Bearer " + this.token }
					})
				if (resp.status == 400 && resp.statusText == 'Bad Request') {
					// fall through to refresh handling
				} else {
					return resp.json();
				}
			} else if (method == 'delete') {
				resp = await fetch(urlString, {
					method: method,
					credentials: 'include',
					headers: reqHeaders,

				})
				if (resp.status == 400 && resp.statusText == 'Bad Request') {
					// fall through to refresh handling
				} else {
					return resp.json();
				}
			} else {
				console.log('Unsupported method.');
			}
			// handling refresh
			// console.log(resp);
			let fooRes = 'Something went wrong...';
			try {
				let refresh = this;
				let foo = async function () {
					let res1 = await resp.json().then(function (res) {
						// console.log(res);
						if (res["status"] == "error" && res["message"] == "Token Invalid.") {
							// console.log("error worked");
							if (refresh.handleRefresh()) {
								// console.log("refresh worked!");
								return new Promise((resolve, reject) => {
									refresh.makeRequest(version, action, params, method, headers, raw)
										.then((res) => resolve(res))
										.catch((res) => reject(res));
								});
							} else {
								console.log("refresh failed..");
								alert('Session has Expired. Please wait while we redirect to login page');
								window.localStorage.clear();
								location.reload();
							}
						} else {
							// error not expired token
							return res;
						}
					});
					// console.log(res1);
					return res1;
				}
				fooRes = await foo();
			}
			catch (e) {
				return null;
			}
			// console.log('refresh comes here....?');
			return fooRes;
		}
		catch (e) {
			return Promise.reject(e);
		}
	}

	errorMessage(message){
		this.messageBox.show(message, '', 'OK', false)
		.then((response) => {
			return response;
		});
	}

	clearMemoizedData(appId, dataName) {
		return delete this.store[appId]?.[dataName];
	}
	
	async getMemoizedData(appId, dataName, url, method = "get", payload = {}) {
		if (this.store[appId]?.[dataName]) return this.store[appId][dataName];
		const response = await this.makeRequest("v1", url, payload, method);
		if (response.status === "success") {
		  if (!this.store[appId]) this.store[appId] = {};
		  this.store[appId][dataName] = response;
		}
		return response;
	}
}