hsl2rgb = (h,s,l, a=s*Math.min(l,1-l), f= (n,k=(n+h/30)%12) => l - a*Math.max(Math.min(k-3,9-k,1),-1)) => [f(0),f(8),f(4)];

rgb2hex = (r,g,b) => "#" + [r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,0) ).join('');

const LAYOUT_HUE = 0;
const LAYOUT_SATURATION = 1;
const LAYOUT_BRIGHTNESS = 2;

removeItemOnce = (arr, value) => {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

class Cache {
    devices = [];

    getOrAddDevice({action, context, device, event, payload}) {
        if(payload.settings.url === undefined) return;

        for(let i = 0; i < this.devices.length; i++){
            if(this.devices[i].url === payload.settings.url){

                // check ob gleicher context
                if(!this.devices[i].contexts.includes(context)) {
                    this.devices[i].contexts.push(context);
                    this.devices[i].actions[context] = action;
                    this.devices[i].settings[context] = payload.settings;
                }

                return this.devices[i];
            }
        }

        // Wenn Device nicht existiert, anlegen
        let tmp = new Device({action, context, device, event, payload});

        this.devices.push(tmp);
        return tmp;
    }

    removeContext({action, context, device, event, payload}){
        if(payload.settings.url === undefined) return;

        for(let i = 0; i < this.devices.length; i++) {
            if (this.devices[i].url === payload.settings.url) {
                this.devices[i].contexts = removeItemOnce(this.devices[i].contexts, context);
                if(this.devices[i].contexts.length === 0) {
                    this.devices = removeItemOnce(this.devices, this.devices[i]);
                }
            }
        }
    }
}

class Device {
    queue = [];
    TimerPid = -1;
    RefreshPid = -1;
    url = "";
    Color = 0;
    Dimmer = 0;
    POWER = 0;
    CT = 0;
    HSBColor = [0,0,0];
    contexts = [];
    actions = [];
    settings = {};
    type = "";

    constructor({action, context, device, event, payload}){
        this.contexts = [context];
        this.actions[context] = action;
        this.settings[context] = payload.settings;
        this.url = this.settings[context].url;
    }

    send({action, context, device, event, payload, querystring}, callback, noQueue = false) {
        if(noQueue) {
            this.doRequest({action, context, device, event, querystring, callback});

        } else {
            for(let i=0; i < this.queue.length; i++){
                let p = this.queue[i];
                if(p.payload === payload) {
                    return;
                }
            }

            this.queue.push({action, context, device, event, querystring, callback});
            this.tick();
        }
    }

    tick() {
        if(this.TimerPid >= 0) clearTimeout(this.TimerPid);

        this.TimerPid = setTimeout(()=>{
            this.TimerPid = -1;
            let tmp = this.queue.pop(); // nur den letzen holen und array leeren
            this.queue = [];

            this.doRequest(tmp);

        }, 200);
    }

    doRequest(tmp){
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.timeout = 2000;

        xhr.onerror = () => {
            tmp.callback(this, false, 'Unable to connect to the bridge.', tmp.action, tmp.context);
        };

        xhr.ontimeout = () => {
            tmp.callback(this, false, 'Connection to the bridge timed out.', tmp.action, tmp.context);
        };

        xhr.onload = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE || xhr.status !== 200) tmp.callback(this, false, 'Could not connect to tasmota device.', tmp.action, tmp.context);
            if (xhr.response === undefined || xhr.response == null) tmp.callback(this, false, 'Bridge response is undefined or null.', tmp.action, tmp.context);

            let result = xhr.response;

            console.log("result: ",xhr.response);

            tmp.callback(this, true, result, tmp.action, tmp.context);
        };

        xhr.open('GET', this.url + tmp.querystring, true);
        xhr.send();
    }

    forEachContext(fnc){
        for(let i = 0; i < this.contexts.length; i++){
            fnc(this.contexts[i]);
        }
    }

    setAutoRefresh(secs, callback){
        console.log("setAutoRefresh: " + secs);


        if(secs < 0) {
            if(this.RefreshPid >= 0) {
                clearInterval(this.RefreshPid);
                this.RefreshPid = -1;
            }
        }

        if(secs > 0) {
            this.RefreshPid = setInterval(callback, secs * 1000);
        }
    }
}
