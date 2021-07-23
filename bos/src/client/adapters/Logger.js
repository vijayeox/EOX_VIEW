import { ServiceProvider } from '@osjs/common';

export class LoggerServiceProvider extends ServiceProvider {

    constructor(core, options = {}) {
        super(core, options || {});
        this.core = core;
    }

    providers() {
        return [
            'oxzion/logger'
        ];
    }

    init() {
        this.core.instance('oxzion/logger', () => ({
            log: (type, message) => this.log(type, message),
        }));
    }

    log(type, message) {
        this.core.make("oxzion/restClient").request(
            "v1",
            "/logger",
            {
                level: type,
                message: message
            },
            "post"
        ).then((response) => {
            if (response.status != "success") {
                console.log('Logging Error - Unable to add ' + type + ' log on the server.');
            }
        });
    }

}