/**
 * Create Server
 */
import { Server } from './Server';

require('dotenv').config();

setTimeout(() => {
  Server.initializeApp().then((app) => {
    // @ts-ignore
    console.log(`App running on http://localhost:${app.address().port}`);
  }).catch(err => {
    console.log(err);
  });
}, 1000);
