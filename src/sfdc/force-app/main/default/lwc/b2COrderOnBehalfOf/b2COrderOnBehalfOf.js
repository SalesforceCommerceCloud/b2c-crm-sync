import { LightningElement, api, track } from 'lwc';

export default class SCCOrderOnBehalfOf extends LightningElement {

    @api token;
    @api siteId;
    @api domain;
    @api shopDomain;
    @api version;


    openPage(){


        var xhr = new XMLHttpRequest();
        xhr.open("POST", this.domain+"/s/"+this.siteId+"/dw/shop/"+this.version+"/sessions", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", this.token);
        xhr.withCredentials = true;

        var s = this.shopDomain+"/on/demandware.store/Sites-"+this.siteId+"-Site";

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 204)) {
                window.open(s, "_blank");
            }
        };

        xhr.send();
    }
}