## install
```javascript
npm i --save mp-boron
```

## Usage

### App
```javascript
import {App as AppFn} from 'mp-boron';

App(
    AppFn({
        async onLaunch(){},
        async onShow(){}
    })
)
```

### Page
```javascript
import {Page as PageFn ,App as AppFn} from 'mp-boron';

Page(
    PageFn({
        async onLoad(){} ,
        async onReady(){},
        async onShow(){}
    })
)
```
Asynchronous life cycle sequence is：

> app onLaunch -> app onShow -> page onLoad -> page onReady -> page onShow 

