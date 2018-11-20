const { isFalse } = require('./util.js');
const state = require('./state');

function App(config) {
    const { onLaunch, onShow, onHide, onError, onPageNotFound } = config;
    let runLaunchLock = false, // 正在运行onLoad锁
        runHookQueue = false, // 正在运行 hook队列的锁
        onShowPending = null;
    return {
        ...config,
        // 运行beforeXXX 回调
        async __runBeforeBoronHook__(hookName, ...args) {
            let runLoad = true;
            let hookFn = config[`shouldRun${hookName}`];
            if (hookFn) {
                runLoad = await hookFn.apply(this, args);
            }
            return runLoad;
        },
        // 运行pending
        async __runBoronHookQueue__(hn) {
            if (!runHookQueue && !runLaunchLock && onShowPending) {
                console.log(
                    '__runBoronHookQueue__',
                    runHookQueue,
                    runLaunchLock,
                    onShowPending,
                    hn
                );
                runHookQueue = true;
                try {
                    let hook = onShowPending;
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
                onShowPending = null;
                runHookQueue = false;
            }
        },
        async __runBoronHook__(hookName, ...args) {
            // onHide 清空 onShow  @TODO 是不是清空onReady
            // onUnload 清空全部
            if (hookName === 'Launch') {
                runLaunchLock = true;
                let runLaunch = await this.__runBeforeBoronHook__.call(this, hookName, ...args);
                !isFalse(runLaunch) && (await onLaunch.apply(this, args));
                runLaunchLock = false;
                await this.__runBoronHookQueue__(hookName);
                state.setAppReady();
            } else if (hookName === 'Show') {
                if (!onShowPending) {
                    onShowPending = { hookName, args };
                    this.__runBoronHookQueue__(hookName);
                }
            } else if (hookName === 'Hide') {
                onShowPending = null;
                let runLoad = await this.__runBeforeBoronHook__.call(this, hookName, ...args);
                !isFalse(runLoad) && (await config[`on${hookName}`].apply(this, args));
            } else {
                let runLoad = await this.__runBeforeBoronHook__.call(this, hookName, ...args);
                !isFalse(runLoad) && (await config[`on${hookName}`].apply(this, args));
            }
        },
        onLaunch(...args) {
            this.__runBoronHook__.call(this, 'Launch', ...args);
        },
        onShow(...args) {
            this.__runBoronHook__.call(this, 'Show', ...args);
        },
        onHide(...args) {
            this.__runBoronHook__.call(this, 'Hide', ...args);
        },
        onError(...args) {
            this.__runBoronHook__.call(this, 'onError', ...args);
        },
        onPageNotFound(...args) {
            this.__runBoronHook__.call(this, 'PageNotFound', ...args);
        }
    };
}

module.exports = App;
