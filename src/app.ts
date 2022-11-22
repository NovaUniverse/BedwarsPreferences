import * as FS from "fs";
import BedwarsPreferenceServer from "./BedwarsPreferenceServer";
import { v4 as uuidv4 } from 'uuid';

require('console-stamp')(console, '[HH:MM:ss.l]');

if (!FS.existsSync("./data")) {
	FS.mkdirSync("./data");
}

if (!FS.existsSync("./data/config.json")) {
    console.log("Creating default configuration");
	let key = uuidv4();
	console.log("First run detcted. Your API key is: " + key);
	let defaultConfig: any = {
		port: 80,
		api_key: key
	}
	FS.writeFileSync("./data/config.json", JSON.stringify(defaultConfig, null, 4), 'utf8');
} else {
	console.log("API key can be found in ./data/config.json");
}

const config: any = JSON.parse(FS.readFileSync("./data/config.json", 'utf8'));

new BedwarsPreferenceServer(config.port, config.api_key, "./data/data.db");