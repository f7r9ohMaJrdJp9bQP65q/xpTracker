

    // required packages 
    const SteamUser           = require('steam-user');
    const GlobalOffensive     = require('globaloffensive');
    const SteamTOTP           = require('steam-totp');
    const rl                  = require('readline-sync');
    const https               = require('https');
    const fs                  = require('fs');
    const bytes               = require('bytes');
    const colors              = require('colors')

    const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");

    const config = require('./config.json');

    checkPackageVersion();

    const client = new Client({ // you can mess around with these intents & partials.
        intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
        ],
        shards: "auto",
        partials: [
        Partials.Message,
        Partials.Channel,
        Partials.User
        ]
    });

    const INTERVAL  = 10 * 60 * 1000; 
    var checkcount  = 0;


    function login ( ) {user.logOn({"accountName": config.username,"password": config.password});};

    var prevData = {
        oldTotal:           0, // Total XP Number, Starting at 327680000
        PlayerLevel:        0, // Player Current XP, 1-40 
        PlayerCurXP:        0, // Current XP, (player_cur_xp - 327680000) 
        PlayerNextLevel:    0, // XP To next level. Math.abs( (player_cur_xp - 327680000) - 5000)
    };


    var user = new SteamUser();
    var csgo = new GlobalOffensive(user);


    login();

    if ( config.display.discord == true ) {
        client.login(config.token); 
    }


    client.on("ready", async () => {
        
        console.log(`${client.user.username} Online`);
        
    })

    user.on('steamGuard', function (domain, callback) {
        if ( config.totp ) {
            callback(SteamTOTP.generateAuthCode(config.totp));
        } else {
            let a = rl.question('Steam guard code: ');
            callback(a);
        };
    });

    user.on('loggedOn', function(details) {
        user.setPersona(SteamUser.EPersonaState.Online); 
        user.gamesPlayed(730); // required to play 730 (CS:GO) to use globaloffensive
    });


    function LookUp() {

        console.clear();

        csgo.requestPlayersProfile(config.target, function (profile) {

            let PlayerEmbed = new EmbedBuilder(); 
                PlayerEmbed.setColor('White');
                PlayerEmbed.setTitle(`XP Stats for: ${config.target}`);
                PlayerEmbed.setThumbnail('https://steamuserimages-a.akamaihd.net/ugc/2009199354848359463/8482E0B73DB7EEB3D749ED7C69C129AE000D7637/');
                PlayerEmbed.setTimestamp()
                
            if ( checkcount > 1 ) { 
                
                if ( config.display.discord == true ) {

                    PlayerEmbed.addFields(
                        { name: '**Player Level**',     value: `${'```'}${profile.player_level}${'```'}`, inline: false },
                        { name: '**Current XP**',       value: `${'```'}${profile.player_cur_xp - 327680000}/5000${'```'}`, inline: true },
                        { name: '**Old XP**',           value: `${'```'}${prevData.PlayerCurXP}/5000${'```'}`, inline: true },
                        { name: '**Earned**',           value: `${'```'}${Math.abs((profile.player_cur_xp - 327680000) - prevData.PlayerCurXP)}${'```'}`, inline: true },
                        { name: '**XP to next level**', value: `${'```'}${Math.abs((profile.player_cur_xp - 327680000) - 5000)}${'```'}`, inline: true }

                    );
                    client.channels.cache.get(config.logChannel).send({ embeds: [PlayerEmbed] });

                }

                if ( config.display.terminal == true ) {

                    console.log(`Player Level: ${colors.yellow(profile.player_level)}${colors.brightYellow('/40')}`);
                    console.log(`Old XP: ${colors.yellow(prevData.PlayerCurXP)}${colors.brightYellow('/5000')}`);
                    console.log(`Current XP: ${colors.yellow(profile.player_cur_xp - 327680000)}${colors.brightYellow('/5000')}`);
                    console.log(`Earned: ${colors.yellow(Math.abs((profile.player_cur_xp - 327680000) - prevData.PlayerCurXP))}`);
                    console.log(`XP to next level: ${colors.yellow(Math.abs((profile.player_cur_xp - 327680000) - 5000))}`);

                }

                
            } else {

                if ( config.display.discord == true ) {
                    
                    PlayerEmbed.addFields(
                        { name: '**Player Level**',     value: `${'```'}${profile.player_level}${'```'}`, inline: false },
                        { name: '**Current XP**',       value: `${'```'}${profile.player_cur_xp - 327680000}/5000${'```'}`, inline: true },
                        { name: '**XP to next level**', value: `${'```'}${Math.abs((profile.player_cur_xp - 327680000) - 5000)}${'```'}`, inline: true }

                    );
                    client.channels.cache.get(config.logChannel).send({ embeds: [PlayerEmbed] });

                } 

                if ( config.display.terminal == true ) {
                
                    console.log(`Player Level: ${colors.yellow(profile.player_level)}${colors.brightYellow('/40')}`);
                    console.log(`Current XP: ${colors.yellow(profile.player_cur_xp - 327680000)}${colors.brightYellow('/5000')}`);
                    console.log(`XP to next level: ${colors.yellow(Math.abs((profile.player_cur_xp - 327680000) - 5000))}`);

                }
            }
            
            prevData = {
                oldTotal: profile.player_cur_xp,
                PlayerLevel: profile.player_level,
                PlayerCurXP: profile.player_cur_xp - 327680000,
                PlayerNextLevel: Math.abs((profile.player_cur_xp - 327680000) - 5000)
            };
        
        });
        checkcount = checkcount + 1;
    }


    csgo.on('connectedToGC', () => {

        LookUp();

        setInterval(() => {LookUp();}, INTERVAL); 

    });

    user.on('error', (err) => {
        console.log(err);
        user.logOff(); // Avoiding ERROR: Logged on, Cannot log on again.
        setInterval(() => { login() }, INTERVAL );
    })






    function checkPackageVersion() {
        // Get the package version from GitHub
        https.get('https://raw.githubusercontent.com/f7r9ohMaJrdJp9bQP65q/TESTREPO/main/package.json', (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const packageJson = JSON.parse(data);
                const githubVersion = packageJson.version;

                const localPackageJson = JSON.parse(fs.readFileSync('./package.json'));
                const localVersion = localPackageJson.version;

                if (githubVersion !== localVersion) {
                    console.log('New version available'.red);
                };
            });
        }).on('error', (err) => {
            console.error(err);
        });
    }

    // Function to format the memory usage
    const formatMemoryUsage = () => {
        const memoryUsage = process.memoryUsage().heapUsed;
        return bytes(memoryUsage);
    };

    // Function to format the uptime
    const formatUptime = () => {
        const uptime = process.uptime();
        const minutes = Math.floor(uptime / 60);
        const seconds = Math.floor(uptime % 60);
        return `${minutes}m ${seconds}s`;
    };

    // Function to update the window title with the memory and uptime information
    const updateWindowTitle = () => {
        const memoryUsage = formatMemoryUsage();
        const uptime = formatUptime();
        const localPackageJson = JSON.parse(fs.readFileSync('./package.json'));
        const localVersion = localPackageJson.version;
        process.title = `xpTracker v${localVersion} | Memory Usage: ${memoryUsage} | Uptime: ${uptime}`;
    };

    setInterval(updateWindowTitle, 1000);
