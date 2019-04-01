import { ServiceProvider } from '@osjs/common';

export class SplashServiceProvider extends ServiceProvider {

	constructor(core, options = {}) {
		super(core, options || {});
		this.core = core;
		this.$loading = document.createElement('div');
    	this.$loading.className = 'osjs-boot-splash';
    	this.$loading.innerHTML = '<img src="./load.gif" height="150" width="150" align="center" style="margin-top:20%;">';
    }
	providers() {
		return [
			'oxzion/splash'
		];
	}
	init() {
		this.core.instance('oxzion/splash', () => ({
			show: (ele) => this.show(ele),
			destroy:()=>this.destroy()
		}));
	}
	
	show(ele) {
      if (!this.$loading.parentNode) {
      		ele = ele ? ele : this.core.$root;
      		ele.appendChild(this.$loading);
   	  }
	}
	destroy(){
		if (this.$loading.parentNode) {
     		this.$loading.remove();
    	}
	}
}