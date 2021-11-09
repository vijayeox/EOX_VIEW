import * as CryptoJS from 'crypto-js';
const SecureStorage = require('secure-web-storage');
const SECRET_KEY = 'secret_key';
import { ServiceProvider } from '@osjs/common';

const isStorageSupported = storageName => {
	if (storageName in window && window[storageName] && window[storageName].setItem)
	{
		const
		s = window[storageName],
		key = 'testLocalStorage_' + window.Math.random();

		try
		{
			s.setItem(key, key);
			if (key === s.getItem(key))
			{
				s.removeItem(key);
				return true;
			}
		}
	    catch (e) {} // eslint-disable-line no-empty
	}

	return false;
};

export default class LocalStorageAdapter {

	constructor(core, options = {}){
		this.localStorageExists = false;
		this.useCookies = true;
		this.core = core;
		this.secureStorage = new SecureStorage(localStorage, {
			hash: function hash(key) {
				key = CryptoJS.SHA256(key, SECRET_KEY);

				return key.toString();
			},
			encrypt: function encrypt(data) {
				data = CryptoJS.AES.encrypt(data, SECRET_KEY);

				data = data.toString();

				return data;
			},
			decrypt: function decrypt(data) {
				data = CryptoJS.AES.decrypt(data, SECRET_KEY);

				data = data.toString(CryptoJS.enc.Utf8);

				return data;
			}
		});
	}

	// check for local storage option in browser
	supported() {
		const isSupported = isStorageSupported('localStorage');
		if(isSupported) {
			this.localStorageExists = true;
			return true;
		}
		return false;
	}

	cookieEnabled() {
		if(window.navigator && window.navigator.cookieEnabled) {
			this.useCookies = true;
			return true;
		}
		else {
			console.log('cookies disabled');
			return false;
		}
	}

	// key - string
	// data - *
	set(key, data) {
		if(this.localStorageExists) {
			try {
				const value = window.localStorage.getItem(key) || null;
				var obj = { key: data, timestamp: new Date().getTime() }
				this.secureStorage.setItem(key,obj);

				console.log('local storage set');
				return true;
			}
			catch (e) {
				console.log(e)
			}
		} else if(this.useCookies) {
			console.log('cookie used');
			var now = new Date();
			now.setTime(now.getTime() + 3 * 3600 * 1000);
			document.cookie += key + ':' + data + 'expires='+ now.toUTCString() + ';';
			return true;
		}
		console.log('storage adapter failed.')
		return false;
	}

	get(key) {
		if(this.localStorageExists) {
			try {
				if(key != null) {
					const data = window.localStorage.getItem(key);
					if(data != null){
						const getsession = window.localStorage.getItem("osjs/session");
						if(getsession != null){
							window.localStorage.removeItem("osjs/session");
							let setsession = JSON.parse(getsession);
							this.set("osjs/session",setsession);
						}
						const getuser = window.localStorage.getItem("User");
						if(getuser != null){
							window.localStorage.removeItem("User");
							let setuser = JSON.parse(getuser);
							this.set("User",setuser["key"]);
						}
						const getreftoken = window.localStorage.getItem("REFRESH_token");
						if(getreftoken != null){
							window.localStorage.removeItem("REFRESH_token");
							let setreftoken = JSON.parse(getreftoken);
							this.set("REFRESH_token",setreftoken["key"]);
						}
						const getuserinfo = window.localStorage.getItem("UserInfo");
						if(getuserinfo != null){
							window.localStorage.removeItem("UserInfo");
							let setuserinfo = JSON.parse(getuserinfo);
							this.set("UserInfo",setuserinfo["key"]);
						}
						const getlocale = window.localStorage.getItem("osjs/locale");
						if(getlocale != null){
							window.localStorage.removeItem("osjs/locale");
							let setlocale = JSON.parse(getlocale);
							this.set("osjs/locale",setlocale);
						}
						const getdesktop = window.localStorage.getItem("osjs/desktop");
						if(getdesktop != null){
							window.localStorage.removeItem("osjs/desktop");
							let setdesktop = JSON.parse(getdesktop);
							this.set("osjs/desktop",setdesktop);
						}
						const getauthtoken = window.localStorage.getItem("AUTH_token");
						if(getauthtoken != null){
							window.localStorage.removeItem("AUTH_token");
							let setauthtoken = JSON.parse(getauthtoken);
							this.set("AUTH_token",setauthtoken["key"]);
						}
					}

					const redata = this.secureStorage.getItem(key);

					return redata;
				} else {
					return null;
				}
			}
			catch (e) {}
		} else if(this.useCookies) {
			var cookies = document.cookie.split(';');
			for(var i = 0; i < cookies.length; i++) {
				var values = cookies[i].split(':');
				if(values[0] == key){
					return values[1];
				}
			}
		}
		return null;
	}

	purge(key) {
		if(this.localStorageExists) {
			try {
				if(key != null) {
					this.secureStorage.removeItem(key);

					console.log('token removed');
				}
				else {
					console.log('invalid operation');
				}
			}
			catch (e) {}
		}
		else if(this.cookieEnabled) {
			try {
				document.cookie = "";
			}
			catch (e) {}
		}
		else {
			console.log('invalid operation');
		}
	}
}
