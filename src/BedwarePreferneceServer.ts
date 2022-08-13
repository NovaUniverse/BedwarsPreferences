import HTTP from "http";
import Express from "express";
import { isValidUUIDV4 } from "is-valid-uuid-v4";

export default class BedwarsPreferenceServer {
    private express: Express.Express;
    private http: HTTP.Server;
    private apiKey: string;

    constructor(port: number, apiKey: string) {
        this.apiKey = apiKey;

        this.express = Express();
        this.express.set("port", port);

        this.express.disable('x-powered-by');

        this.http = new HTTP.Server(this.express);

        this.express.get("/:uuid", async (req: Express.Request, res: Express.Response) => {
            const uuid: string = "" + req.params.uuid;
            if(!isValidUUIDV4(uuid)) {
                res.status(400).send("400: Invalid uuid");
                return;
            }

            res.send(uuid);
        });

        this.http.listen(port, () => {
            console.log("Listening on port: " + port);
        });
    }
}