const {
    EventEmitter
} = require('events')

const fetch = require('node-fetch');

const listingAppForVoiceChannel = {
    youtube: '880218394199220334',
    youtubedev: '880218832743055411',
    poker: '755827207812677713',
    betrayal: '773336526917861400',
    fishing: '814288819477020702',
    chess: '832012774040141894',
    chessdev: '832012586023256104',
    lettertile: '879863686565621790',
    wordsnack: '879863976006127627', 
    doodlecrew: '878067389634314250',
    awkword: '879863881349087252',
    spellcast: '852509694341283871',
    checkers: '832013003968348200',
    puttparty: '763133495793942528',
    sketchheads: '902271654783242291',
    ocho: '832025144389533716'
}

class InitEvents extends EventEmitter {
    constructor(client) {
        if (!client) throw new SyntaxError('Invalid Discord.Client !');
        super()
        this.client = client;

        this.emit('test')

        this.client.on('ready', () => {
            this.client.on('voiceStateUpdate', (options1, options2) => this.voiceStateUpdate(options1, options2))
            this.client.on('messageCreate', (options1) => this.messageCreate(options1))
            this.client.on('guildMemberUpdate', (options1, options2) => this.guildMemberUpdate(options1, options2))
        })
    }


    async createActivityOnChannel(voiceChannelId, application) {
        if(application && listingAppForVoiceChannel[application.toLowerCase()]){
            let ReturnResponses;
            try {
                await fetch('https://discord.com/api/v8/channels/'+ voiceChannelId + '/invites', {
                    method: 'POST',
                    body: JSON.stringify({
                        max_age: 86400,
                        max_uses: 0,
                        target_application_id: listingAppForVoiceChannel[application.toLowerCase()],
                        target_type: 2,
                        tempory: false,
                        validate: null
                    }),
                    headers: {
                        Authorization: 'Bot ' + this.client.token,
                        'Content-Type': 'application/json'
                    }
                }).then((res) => res.json()).then((responses) => {
                    if(!responses.code) throw new Error('An error occurred while creating the invitation link for: ' + application.toLowerCase())
                    else if(Number(responses.code) == 50013) console.warn('Your bot lacks permissions to perform that action')
                    else ReturnResponses = 'https://discord.com/invite/' + responses.code
                })
            }catch(err){
                throw new Error('An error occurred while creating the invitation link for: ' + application.toLowerCase())
            }

            return ReturnResponses
        }else throw new Error('Invalid Application')
    }

    async voiceStateUpdate(options1, options2) {
        let FetchUser1 = await this.client.guilds.cache.get(options1.guild.id).members.fetch(options1.id)
        let FetchChannel1 = await this.client.guilds.cache.get(options1.guild.id).channels.cache.get(options1.channelId)
        let FetchChannel2 = await this.client.guilds.cache.get(options1.guild.id).channels.cache.get(options2.channelId)

        if (options1.channelId == null && options2.channelId !== null) this.emit('VCJoin', {
            'author': FetchUser1.user,
            'channelJoin': FetchChannel2
        })
        else if (options1.channelId !== null && options2.channelId == null) this.emit('VCLeave', {
            'author': FetchUser1.user,
            'channelLeave': FetchChannel1
        })
        else if (options1.channelId !== null && options2.channelId !== null) {
            if (options1.channelId !== options2.channelId) this.emit('VCMove', {
                'author': FetchUser1.user,
                'OldChannel': FetchChannel1,
                'NewChannel': FetchChannel2
            })
            else if (options1.serverDeaf !== options2.serverDeaf) this.emit('VCServerDeaf', {
                'author': FetchUser1.user,
                'channel': FetchChannel1,
                'state': options1.serverDeaf ? 'old' : 'new'
            })
            else if (options1.serverMute !== options2.serverMute) this.emit('VCServerMute', {
                'author': FetchUser1.user,
                'channel': FetchChannel1,
                'state': options1.serverMute ? 'old' : 'new'
            })
            else if (options1.selfDeaf !== options2.selfDeaf) this.emit('VCSelfDeaf', {
                'author': FetchUser1.user,
                'channel': FetchChannel1,
                'state': options1.selfDeaf ? 'old' : 'new'
            })
            else if (options1.selfMute !== options2.selfMute) this.emit('VCSelfMute', {
                'author': FetchUser1.user,
                'channel': FetchChannel1,
                'state': options1.selfMute ? 'old' : 'new'
            })
            else if (options1.selfVideo !== options2.selfVideo) this.emit('VCSelfVideo', {
                'author': FetchUser1.user,
                'channel': FetchChannel1,
                'state': options1.selfVideo ? 'old' : 'new'
            })
            else if (options1.streaming !== options2.streaming) this.emit('VCStreaming', {
                'author': FetchUser1.user,
                'channel': FetchChannel1,
                'state': options1.streaming ? 'old' : 'new'
            })
        }
    }

    async messageCreate(options1) {
        let FetchChannel = await this.client.guilds.cache.get(options1.guild.id).channels.cache.get(options1.channelId)

        if (["www.", "http://", "https://", "discord.gg"].some(link => options1.content.toLowerCase().includes(link))) {
            if (['discord.gg'].some(link => options1.content.toLowerCase().includes(link))) {
                this.emit('MessageHasLink', {
                    'data': {
                        'message': {
                            'id': options1.id,
                            'content': options1.content
                        },
                        'channel': FetchChannel,
                        'author': options1.author,
                        type: 'Discord'
                    }
                })
            } else {
                this.emit('MessageHasLink', {
                    'data': {
                        'message': {
                            'id': options1.id,
                            'content': options1.content
                        },
                        'channel': FetchChannel,
                        'author': options1.author,
                        type: 'Web'
                    }
                })
            }
        }
    }

    async guildMemberUpdate(options1, options2) {
        if (!options1.premiumSince && options2.premiumSince) this.emit('BoostAdd', {
            'guild': options1.guild,
            'author': options1.author
        })
        else if (options1.premiumSince && !options2.premiumSince) this.emit('BoostRemove', {
            'guild': options1.guild,
            'author': options1.author
        })

        if (options1.roles.cache.size < options2.roles.cache.size) {
            for (const role of options2.roles.cache.map(x => x.id)) {
                if (!options1.roles.cache.has(role)) {
                    let RoleGet = options1.guild.roles.cache.get(role);
                    this.emit('MemberRoleAdd', {
                        'role': RoleGet,
                        author: options1.user
                    })
                }
            }
        } else if (options1.roles.cache.size > options2.roles.cache.size) {
            for (const role of options1.roles.cache.map(x => x.id)) {
                if (!options2.roles.cache.has(role)) {
                    let RoleGet = options1.guild.roles.cache.get(role);
                    this.emit('MemberRoleRemove', {
                        'role': RoleGet,
                        author: options1.user,
                        state: 'old'
                    })
                }
            }
        }
    }
}


const init = (client) => new InitEvents(client)



module.exports = {
    init
}