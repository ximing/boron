/*
 * 当前应用全局状态
 */
const EventEmitter = require('eventemitter3');
class State extends EventEmitter {
    constructor() {
        super();
        this.appReady = false;
        this.appReadyCallBack = ['__appReady__'];
    }

    setAppReady() {
        this.appReady = true;
        this.appReadyCallBack = this.appReadyCallBack.filter((item) => {
            this.emit(item);
            return false;
        });
    }

    listenAppReady(eventName) {
        this.appReadyCallBack.push(`__appReady${eventName}__`);
    }

    removeListenAppReady(eventName) {
        let listenName = `__appReady${eventName}__`;
        this.appReadyCallBack = this.appReadyCallBack.filter((item) => item !== listenName);
        this.off(listenName);
    }
}

module.exports = new State();
