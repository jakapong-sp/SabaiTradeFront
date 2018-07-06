// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  /*// Server All 90*/
  url_feed: 'http://203.151.27.223:9123/signalr',
  url_static_api: 'http://203.151.27.223:5000',
  node_static_url: 'http://203.151.27.223:3000'



  /*// local all
  url_feed: 'http://localhost:9123/signalr',
  url_static_api: 'http://localhost:5000',
  node_static_url: 'http://localhost:3000'
*/

};
