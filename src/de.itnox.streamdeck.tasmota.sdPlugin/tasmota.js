setColor = (context, url, pos, callback)=>{
    console.log("Color: " + pos);

    $SD.setFeedback(context, {
        "value": pos,
        "indicator": pos
    });

    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    //t_device.send("/cm?cmnd=Color%20" + color, callback);
    t_device.send("/cm?cmnd=HSBColor1%20" + pos, callback);

}

getHSBColor = (context, url, callback) =>{
    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send("/cm?cmnd=HSBColor", callback, true);
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
    //t_device.send("/cm?cmnd=Dimmer%20" + brightness, callback);
    t_device.send("/cm?cmnd=HSBColor3%20" + brightness, callback);
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

const cache = new Cache();

