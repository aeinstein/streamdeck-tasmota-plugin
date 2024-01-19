/// <reference path="constants.js" />

/**
 * @class Action
 * A Stream Deck plugin action, where you can register callback functions for different events
 */
class ELGSDAction {
	UUID;
	on = EventEmitter.on;
	emit = EventEmitter.emit;

    downTimer = -1;
    _registered = false;

	constructor(UUID) {
		if (!UUID) {
			console.error(
				'An action UUID matching the action UUID in your manifest is required when creating Actions.'
			);
		}

		this.UUID = UUID;
	}

	/**
	 * Registers a callback function for the didReceiveSettings event, which fires when calling getSettings
	 * @param {function} fn
	 */
	onDidReceiveSettings(fn) {
		if (!fn) {
			console.error(
				'A callback function for the didReceiveSettings event is required for onDidReceiveSettings.'
			);
		}

		this.on(`${this.UUID}.${Events.didReceiveSettings}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the keyDown event, which fires when pressing a key down
	 * @param {function} fn
	 */
	onKeyDown(fn) {
		if (!fn) {
			console.error('A callback function for the keyDown event is required for onKeyDown.');
		}

		this.on(`${this.UUID}.${Events.keyDown}`, (jsn) => fn(jsn));
		return this;
	}

    /**
     * Registers a callback function for the keyPressed event, which fires when pressing a key down
     * and release it under 750ms
     * @param {function} fn
     */
    onKeyPressed(fn){
        if (!fn) {
            console.error('A callback function for the keyDown event is required for onKeyDown.');
        }

        this._registerKeyHoldTimer();

        this.on(`${this.UUID}.${Events.keyPressed}`, (jsn) => fn(jsn));
        return this;
    }

    /**
     * Registers a callback function for the keyLongPressed event, which fires when pressing a key down
     * and hold it for minimum 750ms
     * @param {function} fn
     */
    onKeyLongPressed(fn){
        if (!fn) {
            console.error('A callback function for the keyDown event is required for onKeyDown.');
        }

        this._registerKeyHoldTimer();

        this.on(`${this.UUID}.${Events.keyLongPressed}`, (jsn) => fn(jsn));
        return this;
    }

	/**
	 * Registers a callback function for the keyUp event, which fires when releasing a key
	 * @param {function} fn
	 */
	onKeyUp(fn) {
		if (!fn) {
			console.error('A callback function for the keyUp event is required for onKeyUp.');
		}

		this.on(`${this.UUID}.${Events.keyUp}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the willAppear event, which fires when an action appears on the canvas
	 * @param {function} fn
	 */
	onWillAppear(fn) {
		if (!fn) {
			console.error('A callback function for the willAppear event is required for onWillAppear.');
		}

		this.on(`${this.UUID}.${Events.willAppear}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the willAppear event, which fires when an action disappears on the canvas
	 * @param {function} fn
	 */
	onWillDisappear(fn) {
		if (!fn) {
			console.error(
				'A callback function for the willDisappear event is required for onWillDisappear.'
			);
		}

		this.on(`${this.UUID}.${Events.willDisappear}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the titleParametersDidChange event, which fires when a user changes the key title
	 * @param {function} fn
	 */
	onTitleParametersDidChange(fn) {
		if (!fn) {
			console.error(
				'A callback function for the titleParametersDidChange event is required for onTitleParametersDidChange.'
			);
		}

		this.on(`${this.UUID}.${Events.titleParametersDidChange}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the propertyInspectorDidAppear event, which fires when the property inspector is displayed
	 * @param {function} fn
	 */
	onPropertyInspectorDidAppear(fn) {
		if (!fn) {
			console.error(
				'A callback function for the propertyInspectorDidAppear event is required for onPropertyInspectorDidAppear.'
			);
		}

		this.on(`${this.UUID}.${Events.propertyInspectorDidAppear}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the propertyInspectorDidDisappear event, which fires when the property inspector is closed
	 * @param {function} fn
	 */
	onPropertyInspectorDidDisappear(fn) {
		if (!fn) {
			console.error(
				'A callback function for the propertyInspectorDidDisappear event is required for onPropertyInspectorDidDisappear.'
			);
		}

		this.on(`${this.UUID}.${Events.propertyInspectorDidDisappear}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the sendToPlugin event, which fires when the property inspector uses the sendToPlugin api
	 * @param {function} fn
	 */
	onSendToPlugin(fn) {
		if (!fn) {
			console.error(
				'A callback function for the sendToPlugin event is required for onSendToPlugin.'
			);
		}

		this.on(`${this.UUID}.${Events.sendToPlugin}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the onDialRotate event, which fires when a SD+ dial was rotated
	 * @param {function} fn
	 */
	onDialRotate(fn) {
		if (!fn) {
			console.error('A callback function for the onDialRotate event is required for onDialRotate.');
		}
		this.on(`${this.UUID}.${Events.dialRotate}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the dialPress event, which fires when a SD+ dial was pressed or released
	 * @deprecated Use onDialUp and onDialDown instead
	 */
	onDialPress(fn) {
		if (!fn) {
			console.error('A callback function for the dialPress event is required for onDialPress.');
		}
		this.on(`${this.UUID}.${Events.dialPress}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the dialDown event, which fires when a SD+ dial was pressed
	 * @param {function} fn
	 */
	onDialDown(fn) {
		if (!fn) {
			console.error('A callback function for the dialDown event is required for onDialDown.');
		}
		this.on(`${this.UUID}.${Events.dialDown}`, (jsn) => fn(jsn));
		return this;
	}

	/**
	 * Registers a callback function for the dialUp event, which fires when a pressed SD+ dial was released
	 * @param {function} fn
	 */
	onDialUp(fn) {
		if (!fn) {
			console.error('A callback function for the dialUp event is required for onDialUp.');
		}
		this.on(`${this.UUID}.${Events.dialUp}`, (jsn) => fn(jsn));
		return this;
	}

    /**
     * Registers a callback function for the onDialPressed event, which fires when a pressed SD+ dial was released
     * within 750ms
     * @param {function} fn
     */
    onDialPressed(fn) {
        if (!fn) {
            console.error('A callback function for the dialPressed event is required for onDialPressed.');
        }
        this._registerDialHoldTimer();
        this.on(`${this.UUID}.${Events.dialPressed}`, (jsn) => fn(jsn));
        return this;
    }

    /**
     * Registers a callback function for the onDialLongPressed event, which fires when a pressed SD+ dial was hold
     * for minimum 750ms
     * @param {function} fn
     */
    onDialLongPressed(fn) {
        if (!fn) {
            console.error('A callback function for the dialLongPressed event is required for onLongDialPressed.');
        }
        this._registerDialHoldTimer();
        this.on(`${this.UUID}.${Events.dialLongPressed}`, (jsn) => fn(jsn));
        return this;
    }

	/**
	 * Registers a callback function for the touchTap event, which fires when a SD+ touch panel was touched quickly
	 * @param {function} fn
	 */
	onTouchTap(fn) {
		if (!fn) {
			console.error(
				'A callback function for the onTouchTap event is required for onTouchTap.'
			);
		}
		this.on(`${this.UUID}.${Events.touchTap}`, (jsn) => fn(jsn));
		return this;
	}

    _registerKeyHoldTimer(){
        if(this._registered) return;

        const sender = this;

        this.on(`${this.UUID}.${Events.keyDown}`, (jsn) => {
            if(sender.downTimer >= 0) clearTimeout(sender.downTimer);

            sender.downTimer = setTimeout(()=>{
                sender.downTimer = -1;
                jsn.event = "keyLongPressed";
                this.emit(`${this.UUID}.${Events.keyLongPressed}`, jsn);
            }, 500);
        });

        this.on(`${this.UUID}.${Events.keyUp}`, (jsn) => {
            if(sender.downTimer >= 0) {
                clearTimeout(sender.downTimer);
                sender.downTimer = -1;
                jsn.event = "keyPressed";
                this.emit(`${this.UUID}.${Events.keyPressed}`, jsn);
            }
        });
    }

    _registerDialHoldTimer(){
        if(this._registered) return;

        const sender = this;

        this.on(`${this.UUID}.${Events.dialDown}`, (jsn) => {
            if(sender.downTimer >= 0) clearTimeout(sender.downTimer);

            sender.downTimer = setTimeout(()=>{
                sender.downTimer = -1;
                jsn.event = "dialLongPressed";
                this.emit(`${this.UUID}.${Events.dialLongPressed}`, jsn);
            }, 500);
        });

        this.on(`${this.UUID}.${Events.dialUp}`, (jsn) => {
            if(sender.downTimer >= 0) {
                clearTimeout(sender.downTimer);
                sender.downTimer = -1;
                jsn.event = "dialPressed";
                this.emit(`${this.UUID}.${Events.dialPressed}`, jsn);
            }
        });
    }
}

const Action = ELGSDAction;
