percent2RGB = (col) =>{
    // 0:#ff0000,0.33:#00ff00,0.66:#0000ff,1:#ff0000

    const gradient = {
        0: [255,0,0],
        33: [0,255,0],
        66: [0,0,255],
        100: [255,0,0]
    };

    let start, end;

    for (const k in gradient) {
        if(k == col) {
            start = k;
            end = k;
            break;
        }

        if(k < col) {
            start = k;
        }

        if(k > col) {
            end = k;
            break;
        }
    }


    let red = interpolateValue(gradient[start][0], gradient[end][0], start, end, col);
    let green = interpolateValue(gradient[start][1], gradient[end][1], start, end, col);
    let blue = interpolateValue(gradient[start][2], gradient[end][2], start, end, col);


    return "" + red.toString(16).padStart(2, '0') +
        green.toString(16).padStart(2, '0') +
        blue.toString(16).padStart(2, '0');
}

interpolateValue = (start_color, end_color, start_val, end_val, val)=>{
    if(start_color == end_color) return start_color;

    let steps = (end_val - start_val);
    let step_size = (end_color - start_color) / steps;
    val -= start_val;
    return Math.floor(start_color + (step_size *val));
}

removeItemOnce = (arr, value) => {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

class Cache {
    devices = [];

    getOrAddDevice(context, settings) {
        if(settings.url === undefined) return;

        for(let i = 0; i < this.devices.length; i++){
            if(this.devices[i].url === settings.url){

                // check ob gleicher context
                if(!this.devices[i].contexts.includes(context)) this.devices[i].contexts.push(context);

                return this.devices[i];
            }
        }

        // Wenn Device nicht existiert, anlegen
        let tmp = new Device(context, settings);

        this.devices.push(tmp);
        return tmp;
    }

    removeContext(context, settings){
        if(settings.url === undefined) return;

        for(let i = 0; i < this.devices.length; i++) {
            if (this.devices[i].url === settings.url) {
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
    settings = {};

    constructor(context, settings){
        this.contexts = [ context ];
        this.settings = settings;
        this.url = settings.url;
    }

    send(payload, callback, noQueue) {
        if(noQueue) {
            this.doRequest({payload, callback});

        } else {
            this.queue.push({payload, callback});
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
            tmp.callback(this, false, 'Unable to connect to the bridge.');
        };

        xhr.ontimeout = () => {
            tmp.callback(this, false, 'Connection to the bridge timed out.');
        };

        xhr.onload = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE || xhr.status !== 200) tmp.callback(this, false, 'Could not connect to tasmota device.');
            if (xhr.response === undefined || xhr.response == null) tmp.callback(this, false, 'Bridge response is undefined or null.');

            let result = xhr.response;

            console.log("result: ",xhr.response);

            tmp.callback(this, true, result);
        };

        xhr.open('GET', this.url + tmp.payload, true);
        xhr.send();
    }

    forEachContext(fnc){
        for(let i = 0; i < this.contexts.length; i++){
            fnc(this.contexts[i]);
        }
    }

    setAutoRefresh(secs, callback){
        console.log("setAutoRefresh: " + secs);

        if(secs > 0) {
            this.RefreshPid = setInterval(callback, secs * 1000);
        } else {
            if(this.RefreshPid >= 0) {
                clearInterval(this.RefreshPid);
                this.RefreshPid = -1;
            }
        }
    }
}
