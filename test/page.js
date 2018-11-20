const {wait} = require('./helper/util');
const {Page,App} = require('../src');

test('page', async () => {
    jest.setTimeout(30000);
    const app = App({
      async onLaunch(){
          this.launch = false;
          await wait(1500);
          console.log('onLaunch');
          this.launch = true;
      },
      async onShow(){
         this.show = false;
         console.log('onShow');
         await wait(1000);
         this.show = true;
      }
  });
  app.onLaunch();
  const page = Page({
      route:'pages/index',
      async onLoad(){
          this.load = false;
          await wait(500);
          console.log('onLoad');
          this.load = true;
      },
      async onReady(){
          this.ready = false;
          await wait(500);
          console.log('onReady');
          this.ready = true;
      },
      async onShow(){
         this.show = false;
         console.log('onShow');
         await wait(500);
         this.show = true;
      },
      async onHide(){
         this.hide = false;
         console.log('onHide');
         await wait(500);
         this.hide = true;
      },
      async onUnload(){
         this.unload = false;
         console.log('onUnload');
         await wait(500);
         this.unload = true;
      }
  })
  app.onShow();
  page.onLoad();
  await wait(500);
  page.onReady();
  page.onShow();
  page.onHide();
  page.onShow();
  expect(page.load).toEqual(void 0);
  expect(page.ready).toEqual(void 0);
  expect(page.show).toEqual(void 0);
  expect(page.hide).toEqual(void 0);
  expect(page.unload).toEqual(void 0);
  await wait(1000);
  expect(page.load).toEqual(void 0);
  await wait(1200);
  expect(page.load).toEqual(false);
  expect(page.ready).toEqual(void 0);
  await wait(600);
  expect(page.load).toEqual(true);
  expect(page.ready).toEqual(false);
  expect(page.show).toEqual(void 0);
  await wait(1200);
  expect(page.load).toEqual(true);
  expect(page.ready).toEqual(true);
  expect(page.show).toEqual(true);
  page.onHide();
  page.onUnload();
  await wait(1200);
})