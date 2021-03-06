/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */

/**
 * Wechaty bot use a Tuling123.com brain
 *
 * Apply your own tuling123.com API_KEY
 * at: http://www.tuling123.com/html/doc/api.html
 *
 * Enjoy!
 */
/* tslint:disable:no-var-requires */
/* tslint:disable:variable-name */
const qrcodeTerminal  = require('qrcode-terminal')
const Tuling123       = require('tuling123-client')

/**
 * Change `import { ... } from '../'`
 * to     `import { ... } from 'wechaty'`
 * when you are runing with Docker or NPM instead of Git Source.
 */
import {
  Wechaty,
  log,
}           from '../src/'

// log.level = 'verbose'
// log.level = 'silly'

/**
 *
 * Apply Your Own Tuling123 Developer API_KEY at:
 * http://www.tuling123.com
 *
 */
const TULING123_API_KEY = '18f25157e0446df58ade098479f74b21'
const tuling = new Tuling123(TULING123_API_KEY)

const bot = Wechaty.instance()

console.log(`
Welcome to Tuling Wechaty Bot.
Tuling API: http://www.tuling123.com/html/doc/api.html

Notice: This bot will only active in the room which name contains 'wechaty'.
/* if (/Wechaty/i.test(room.get('name'))) { */

Loading...
`)

bot
.on('login'  , user => log.info('Bot', `bot login: ${user}`))
.on('logout' , user => log.info('Bot', 'bot %s logout.', user))
.on('scan', (qrcode, status) => {
  qrcodeTerminal.generate(qrcode)
  console.log(`${qrcode}\n[${status}] Scan QR Code in above url to login: `)
})
.on('message', async msg => {
  // Skip message from self, or inside a room
  if (msg.self() || msg.room()) return

  log.info('Bot', 'talk: %s'  , msg)

  try {
    const {text: reply} = await tuling.ask(msg.text(), {userid: msg.from()})
    log.info('Tuling123', 'Talker reply:"%s" for "%s" ',
                          reply,
                          msg.text(),
            )
    await msg.say(reply)
  } catch (e) {
    log.error('Bot', 'on message tuling.ask() exception: %s' , e && e.message || e)
  }
})

bot.start()
.catch(async e => {
  log.error('Bot', 'start() fail:' + e)
  await bot.stop()
  process.exit(-1)
})
