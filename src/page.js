const { isFalse } = require('./util.js');
const state = require('./state');

function Page(config) {
    const { onLoad, onReady, onShow, onHide, onUnload } = config;
    let queue = [],
        runLoadLock = false, // 正在运行onLoad锁
        runHookQueue = false; // 正在运行 hook队列的锁
    return {
        ...config,
        async __runBeforeBoronHook__(hookName, ...args) {
            let runLoad = true;
            let hookFn = config[`shouldRun${hookName}`];
            if (hookFn) {
                runLoad = await hookFn.apply(this, args);
            }
            return runLoad;
        },
        async __runBoronHookQueue__() {
            if (!runHookQueue && queue.length > 0 && !runLoadLock) {
                runHookQueue = true;
                for (let i = 0; i < queue.length; i++) {
                    try {
                        let hook = queue[i];
                        let runLoad = await this.__runBeforeBoronHook__.call(
                            this,
                            hook.hookName,
                            ...hook.args
                        );
                        !isFalse(runLoad) &&
                            (await config[`on${hook.hookName}`].apply(this, hook.args));
                    } catch (err) {
                        console.error(err);
                    }
                }
                queue = [];
                runHookQueue = false;
            }
        },
        async doAfterAppReady() {
            if (!state.appReady) {
                state.listenAppReady(this.route);
                await new Promise((resolve) => {
                    // 为了再页面销毁的时候移除监听函数
                    state.once(`__appReady${this.route}__`, () => {
                        resolve();
                    });
                });
            }
        },
        async __runBoronHook__(hookName, ...args) {
            // onHide 清空 onShow  @TODO 是不是清空onReady
            // onUnload 清空全部
            if (hookName === 'Load') {
                runLoadLock = true;
                await this.doAfterAppReady();
                let runLoad = await this.__runBeforeBoronHook__.call(this, hookName, ...args);
                !isFalse(runLoad) && (await onLoad.apply(this, args));
                runLoadLock = false;
                this.__runBoronHookQueue__();
            } else if (hookName === 'Ready' || hookName === 'Show') {
                if (!queue.filter((item) => item.hookName === hookName).length) {
                    queue.push({ hookName, args });
                    this.__runBoronHookQueue__();
                }
            } else if (hookName === 'Hide' || hookName === 'Unload') {
                queue = hookName === 'Hide' ? queue.filter((item) => item !== 'Show') : [];
                let runLoad = await this.__runBeforeBoronHook__.call(this, hookName, ...args);
                !isFalse(runLoad) && (await config[`on${hookName}`].apply(this, args));
            }
        },
        onLoad(...args) {
            this.__runBoronHook__.call(this, 'Load', ...args);
        },
        onReady(...args) {
            this.__runBoronHook__.call(this, 'Ready', ...args);
        },
        onShow(...args) {
            this.__runBoronHook__.call(this, 'Show', ...args);
        },
        onHide(...args) {
            this.__runBoronHook__.call(this, 'Hide', ...args);
        },
        onUnload(...args) {
            state.removeListenAppReady(this.route);
            this.__runBoronHook__.call(this, 'Unload', ...args);
        }
    };
}

module.exports = Page;
