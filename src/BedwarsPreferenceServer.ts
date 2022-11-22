import HTTP from "http";
import Express from "express";
import { isValidUUIDV4 } from "is-valid-uuid-v4";
import Loki from "lokijs";
import bodyParser from "body-parser";

export default class BedwarsPreferenceServer {
	public static PLAYER_DATA_DB = "player_data";

	private express: Express.Express;
	private http: HTTP.Server;
	private apiKey: string;
	
	private db: Loki;

	constructor(port: number, apiKey: string, dbPath: string) {
		this.apiKey = apiKey;

		this.db = new Loki(dbPath, {
			autoload: true,
			autosave: true
		});

		if(this.db.getCollection(BedwarsPreferenceServer.PLAYER_DATA_DB) == null) {
			this.db.addCollection(BedwarsPreferenceServer.PLAYER_DATA_DB);
		}

		this.express = Express();
		this.express.set("port", port);

		this.express.disable('x-powered-by');

		this.express.use(bodyParser.json({}));

		this.http = new HTTP.Server(this.express);

		this.express.get("/:uuid", async (req: Express.Request, res: Express.Response) => {
			const uuid: string = "" + req.params.uuid;
			if(!isValidUUIDV4(uuid)) {
				res.status(400).send("400: Invalid uuid");
				return;
			}

			const data = this.db.getCollection(BedwarsPreferenceServer.PLAYER_DATA_DB).findObject({uuid: uuid});
			if(data == null) {
				console.log("No data found for user " + uuid);
				res.status(404).send("404: No data found for that player");
				return;
			}

			console.log("Fetched data for user " + uuid);

			res.header("Content-Type", 'application/json');
			res.status(200).send(JSON.stringify(data, null, 4));
		});

		this.express.post("/:uuid", async (req: Express.Request, res: Express.Response) => {
			if (!req.headers.authorization) {
				res.status(401).send("401: Unauthorized");
				return;
			}

			if (req.headers.authorization != this.apiKey) {
				res.status(401).send("401: Unauthorized");
				return;
			}
			
			const uuid: string = "" + req.params.uuid;
			if(!isValidUUIDV4(uuid)) {
				res.status(400).send("400: Invalid uuid");
				return;
			}

			const data = req.body;

			if(!Array.isArray(data)) {
				res.status(400).send("400: Data is not an array");
				return;
			}

			const newObject = {
				uuid: uuid,
				data: data
			}

			let entry = this.db.getCollection(BedwarsPreferenceServer.PLAYER_DATA_DB).findOne({uuid: uuid});
			if(entry == null) {
				this.db.getCollection(BedwarsPreferenceServer.PLAYER_DATA_DB).insertOne(newObject);
			} else {
				this.db.getCollection(BedwarsPreferenceServer.PLAYER_DATA_DB).chain().find({uuid: uuid}).update(o => o.data = newObject.data);
			}

			console.log("Saved data for user " + uuid);

			res.status(200).send("ok");
		});

		this.http.listen(port, () => {
			console.log("Listening on port: " + port);
		});
	}
}