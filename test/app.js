const {Page,App} = require('../src');
const {wait} = require('./helper/util');
test('App', async () => {
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
  })
  app.onLaunch();
  app.onShow();
  await wait(1000);
  expect(app.launch).toEqual(false);
  expect(app.show).toEqual(void 0);
  await wait(1000);
  expect(app.launch).toEqual(true);
  expect(app.show).toEqual(false);
  await wait(1200);
  expect(app.show).toEqual(true);
});