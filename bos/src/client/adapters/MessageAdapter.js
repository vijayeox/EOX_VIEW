import { ServiceProvider } from "@osjs/common";
import LocalStorageAdapter from "./localStorageAdapter.js";
import Swal from "sweetalert2";
export class MessageServiceProvider extends ServiceProvider {
    constructor(core, options = {}) {
        super(core, options || {});
        this.core = core;
    }

    providers() {
        return ["oxzion/messageDialog"];
    }

    init() {
        this.core.instance("oxzion/messageDialog", () => ({
            show: (title, message, confirmButtuonText, showCancelButton) => this.show(title, message, confirmButtuonText, showCancelButton),
        }));
    }

    async show(title, message, confirmButtuonText, showCancelButtonText,imageUrl = null,icon = undefined,iconColor = undefined) {
        return await Swal.fire({
            title: title,
            text: message,
            imageUrl: imageUrl ? imageUrl : undefined,
            imageWidth: 75,
            imageHeight: 75,
            confirmButtonText: confirmButtuonText,
            confirmButtonColor: "#d33",
            showCancelButton: showCancelButtonText,
            cancelButtonColor: "#3085d6",
            icon : icon ? icon : undefined,
            iconColor: iconColor ? iconColor : undefined,
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if(result.hasOwnProperty('dismiss')){
                return false;
            }else{
                return true;
            }
        });
    }
}