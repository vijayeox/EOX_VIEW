import { ServiceProvider } from '@osjs/common';

export class WebSocketAdapter extends ServiceProvider {

	constructor(core, options = {}) {
		super(core, options || {});
		this.core = core;
		this.token = null;
		this.baseUrl = this.core.config('wrapper.url');
	}


	providers() {
		return [
			'oxzion/notification'
		];
	}

	async init() {
		this.core.on('osjs/core:connect', (ev, reconnected) => {
            let profileInfo = this.core.make('oxzion/profile').get();
            let socketInformation = {name:"storeUserInfo",params:[profileInfo['key']]};
            this.core.ws.send(JSON.stringify(socketInformation));
          });
        this.core.on("notification",(...params)=>{
            var notificationContent = {};
            for (var i = 0; i < params.length; ++i){
                var key = Object.keys(params[i])[0];
                notificationContent[key] = params[i][key];
            }
            this.core.make('osjs/notification', {
                message: notificationContent['message'],
                icon: notificationContent['icon']?notificationContent['icon']:'default.png',
                onclick: () => console.log('Clicked!')
              })
        });
	}
}