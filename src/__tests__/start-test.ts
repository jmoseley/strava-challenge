import * as start from '../start';

describe(`main`, () => {
  it(`starts`, async () => {
    const server = await start.main();
    console.log('done starting');
    server.close();
  });
});
