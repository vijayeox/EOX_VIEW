import { ServiceProvider } from '@osjs/common';
import LocalStorageAdapter from './localStorageAdapter.js';

export class UserSessionServiceProvider extends ServiceProvider {

	constructor(core, options = {}) {
		super(core, options || {});
		this.core = core;
		core.on('osjs/core:logged-in', () => 
			this.get());
	}

	providers() {
		return [
			'oxzion/usersession'
		];
	}

	init() {
		this.core.instance('oxzion/usersession', () => ({
			get: () => this.get(),
			set: () => this.setUserSession(),
		}));
	}
	
	async get(){
		let helper = this.core.make('oxzion/restClient');
    	let session = await helper.request('v1','/user/me/getsession', {}, 'get' );
    	this.core.make('osjs/settings').set('osjs/session', null, session['data']).save();		
	}
	async setUserSession() {
          let session = this.core.make('osjs/settings').get('osjs/session');
          let helper = this.core.make("oxzion/restClient");
     	  let updatesession = await helper.request(
        	"v1",
        	"/user/me/updatesession",{data: JSON.stringify(session)},
        	"post"
      );

    }
	
}