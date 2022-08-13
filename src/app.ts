import * as FS from "fs";
import BedwarsPreferenceServer from "./BedwarePreferneceServer";
import { v4 as uuidv4 } from 'uuid';

require('console-stamp')(console, '[HH:MM:ss.l]');

if (!FS.existsSync("./config")) {
	FS.mkdirSync("./config");
}

if (!FS.existsSync("./config/config.json")) {
    console.log("Creating default configuration");
	let key = uuidv4();
	console.log("First run detcted. Your API key is: " + key);
	let defaultConfig: any = {
		port: 80,
		api_key: key
	}
	FS.writeFileSync("./config/config.json", JSON.stringify(defaultConfig, null, 4), 'utf8');
} else {
	console.log("API key can be found in ./config/config.json");
}

const config: any = JSON.parse(FS.readFileSync("./config/config.json", 'utf8'));

new BedwarsPreferenceServer(config.port, config.api_key);