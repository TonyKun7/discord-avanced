<h1 align="center">Welcome to @tonykun7/discord-avanced 👋</h1>
Allows you to have more precise events than discord.

## Install

```sh
npm install @tonykun7/discord-avanced
```

## Usage
```javascript
const EventInit = require('@tonykun7/discord-avanced')

/*
or
*/

const {init} = require('@tonykun7/discord-avanced')
```

## How to initialize
```javascript
const { Client, Intents } = require('discord.js')

const client = new Client({
    intents: [        
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})


const {init} = require('@tonykun7/discord-avanced')

let event = init(client)
```

## All Events
```javascript
event.on('VCJoin', (data) => console.log(data))
event.on('VCLeave', (data) => console.log(data))
event.on('VCMove', (data) => console.log(data))
event.on('VCServerDeaf', (data) => console.log(data))
event.on('VCServerMute', (data) => console.log(data))
event.on('VCSelfDeaf', (data) => console.log(data))
event.on('VCSelfMute', (data) => console.log(data))
event.on('VCSelfVideo', (data) => console.log(data))
event.on('VCStreaming', (data) => console.log(data))
event.on('MessageHasLink', (data) => console.log(data))
event.on('BoostAdd', (data) => console.log(data))
event.on('BoostRemove', (data) => console.log(data))
event.on('MemberRoleAdd', (data) => console.log(data))
event.on('MemberRoleRemove', (data) => console.log(data))
```

```javascript
event.on('VCJoin', (data) => {
    client.channels.cache.get(<id>).send({content: `${data.author.username} join voice channel ${data.channelJoin.name}`})
})
```
## Create Activity On Voice Channel
```javascript
event.on('VCJoin', (data) => {
    event.createActivityOnChannel(data.channelJoin.id, 'youtube').then(r => {
      client.channels.cache.get(<id>).send({content: `${data.author.username} Here is a link to access the youtube application: ${r}`})
    }).catch(e => console.log(e))
})
```


## Author
👤 **@tonykun7**
