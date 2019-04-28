const Discord = require('discord.js')
const client = new Discord.Client()
client.commands = new Discord.Collection()
const request = require('request')
const fs = require('fs')
const config = require('./config.json')
let profile = require('./profile.json')
client.login(config.token).catch((err) => {
	//If node.js cut err with text err easy off script
	// process.exit(0);
})

fs.readdir('./cmds/', (err, files) => {
	if (err) console.log(err)
	let jsfiles = files.filter(f => f.split(".").pop() === "js")
	if (jsfiles.length <= 0) console.log("Нет команд для загрузки!!")
	jsfiles.forEach((f, i) => {
		let props = require(`./cmds/${f}`)
		console.log(`${i + 1}. ${f} Загружен!`)
		client.commands.set(props.help.name, props)
	})
})

client.on("ready", () => {
	client.guilds.get("556392341045248000").channels.get("568488224108838912").send("Привет, Я запустился!").then((mess) => mess.delete(2500))
	client.channels.get("568493650175066123").setName(`Всего пользователей: ${client.guilds.get("556392341045248000").memberCount}`)
	console.log(`Запустился бот ${client.user.username}`)
})

client.on("message", (message) => {
	if (message.author.bot) return
	if (message.channel.type == "dm") return
	let uid = message.author.id
	if (!profile[uid]) {
		profile[uid] = {
			coin: 0,
			warns: 0,
			xp: 0,
			level: 0,
			warns_reason: {},
			rep: 0,
			repl: {},
		}
	}
	let u = profile[uid]
	u.coin++
	u.xp++
	if (u.xp >= (u.level * 10 + 1)) {
		u.xp = 0
		u.level += 1
	};
	fs.writeFile('./profile.json', JSON.stringify(profile), (err) => {
		if (err) console.log(err)
	})
	if (u.level == '1') {
		const role = message.guild.roles.get('565616083269058576')
		message.member.addRole(role).catch(console.error)
	}
	let messageArray = message.content.split(" ")
	let command = messageArray[0].toLowerCase()
	let args = messageArray.slice(1)
	if (!message.content.startsWith(config.prefix)) return
	let cmd = client.commands.get(command.slice(config.prefix.length))
	if (cmd) cmd.run(client, message, args)
})

client.on("guildMemberAdd", (member) => {
	client.channels.get("568493650175066123").setName(`Всего пользователей: ${client.guilds.get("556392341045248000").memberCount}`)
	client.channels.get("570287675198930966").send(`К нам присоеденился ${member}`)
})

client.on("guildMemberRemove", (member) => {
	client.channels.get("568493650175066123").setName(`Всего пользователей: ${client.guilds.get("556392341045248000").memberCount}`)
	client.channels.get("570287675198930966").send(`Нас покинул ${member}`)
})