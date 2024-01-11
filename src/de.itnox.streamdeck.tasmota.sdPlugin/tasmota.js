setColor = (context, url, pos, color, callback)=>{
    console.log("Color: " + color);

    $SD.setFeedback(context, {
        "value": color,
        "indicator": pos
    });

    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send("/cm?cmnd=Color%20" + color, callback);
}

setBrightness = (context, url, brightness, callback)=>{
    console.log("Brightness: " + brightness);

    $SD.setFeedback(context, {
        "value": brightness,
        "indicator": brightness
    });

    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send("/cm?cmnd=Dimmer%20" + brightness, callback);
}

getBrightness = (context, url, callback) =>{
    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send("/cm?cmnd=Dimmer", callback, true);
}

getTemperature = (context, url, callback) =>{
    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send("/cm?cmnd=HSBColor2", callback, true);
}

setTemperature = (context, url, pos, callback)=>{
    console.log("saturation: " + pos);

    $SD.setFeedback(context, {
        "value": pos,
        "indicator": pos
    });


    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send("/cm?cmnd=HSBColor2%20" + pos, callback);
}







getColor = (context, url, callback) =>{
    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send("/cm?cmnd=Color", callback, true);
}







const cache = new Cache();

