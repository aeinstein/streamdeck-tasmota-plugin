setColor = (context, url, pos, color, callback)=>{
    console.log("Color: " + color);

    //color = color.replace("#", "");

    $SD.setFeedback(context, {
        "value": color,
        "indicator": pos
    });

    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    const t_device = cache.getOrAddDevice(url);
    t_device.send(context, "/cm?cmnd=Color%20" + color, callback);
}

setBrightness = (context, url, brightness, callback)=>{
    console.log("Brightness: " + brightness);

    $SD.setFeedback(context, {
        "value": brightness,
        "indicator": brightness
    });

    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    const t_device = cache.getOrAddDevice(url);
    t_device.send(context, "/cm?cmnd=Brightness%20" + brightness, callback);
}

setTemperature = (context, url, color, callback)=>{
    console.log("Temperature: " + color);

    $SD.setFeedback(context, {
        "value": color,
        "indicator": color
    });
}

getOutlet = (context, url, callback) =>{
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    const t_device = cache.getOrAddDevice(url);
    t_device.send(context, "/cm?cmnd=Power", callback);
}

setOutlet = (context, url, plug, callback) => {
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    if(plug) url += "/cm?cmnd=Power%20On";
    else url += "/cm?cmnd=Power%20Off";

    console.log("setOutlet: " + url);

    const xhr = createXHR(context, callback);
    xhr.open('GET', url, true);
    xhr.send();
}

getColor = (context, url, callback) =>{
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    const t_device = cache.getOrAddDevice(url);
    t_device.send(context, "/cm?cmnd=Color", callback);
}

getBrightness = (context, url, callback) =>{
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    const t_device = cache.getOrAddDevice(url);
    t_device.send(context, "/cm?cmnd=Brightness", callback);
}

getTemperature = (context, url, callback) =>{
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    const t_device = cache.getOrAddDevice(url);
    t_device.send(context, "/cm?cmnd=Temp", callback);
}

class Cache {
    devices = [];

    getOrAddDevice(url) {
        for(let i = 0; i < this.devices.length; i++){
            if(this.devices[i].url === url){
                return this.devices[i];
            }
        }

        let tmp = new Device(url);

        this.devices.push(tmp);
        return tmp;
    }
}

class Device {
    queue = [];
    TimerPid = -1;
    url = "";
    color = 0;
    brightness = 0;
    power = 0;
    temp = 0;

    constructor(url){
        this.url = url;
    }

    send(context, payload, callback) {
        this.queue.push({context, payload, callback});

        this.tick();
    }

    tick() {
        if(this.TimerPid >= 0) clearTimeout(this.TimerPid);

        this.TimerPid = setTimeout(()=>{
            this.TimerPid = -1;
            let tmp = this.queue.pop(); // nur den letzen holen und array leeren
            this.queue = [];

            const xhr = createXHR(tmp.context, tmp.callback);
            xhr.open('GET', this.url + tmp.payload, true);
            xhr.send();

        }, 300);
    }
}

const cache = new Cache();

