import express from "express"
import {documentDatabase} from "./firebase_client";

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    await documentDatabase
        .collection("test")
        .doc("test-id")
        .set({
            title: "Hey"
        })
    res.send('Hello World, du arsch!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
