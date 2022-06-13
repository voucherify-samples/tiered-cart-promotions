require("dotenv").config();
const { VoucherifyServerSide } = require("@voucherify/sdk");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const client = VoucherifyServerSide({
    applicationId: `${process.env.VOUCHERIFY_APP_ID}`,
    secretKey    : `${process.env.VOUCHERIFY_SECRET_KEY}`,
    // apiUrl: 'https://<region>.api.voucherify.io'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../client")));

app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", [ "*" ]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.post("/stack-validate", (req, res) => {
    const stackObject = req.body.stackObject;

    client.validations.validate(stackObject).then(response => {
        if (response) {
            return res.status(200).send({
                promotions: response.promotions
            });
        }
        return res.status(404).send({
            status : "error",
            message: "Cannot validate"
        });
    }).catch(() => {
        return res.status(400).send({
            status : "error",
            message: "Cannot validate"
        });
    });
});

app.post("/redeem-stackable", (req, res) => {
    const stackObject = req.body.stackObject;
    client.redemptions.redeemStackable(stackObject).then(response => {
        if (response.redemptions[0].result) {
            res.status(200).send({
                status: "success"
            });
        } else {
            res.status(404).send({
                status : "error",
                message: "Redeem promotions is not possible"
            });
        }
    }).catch(() => {
        res.status(400).send({
            status : "error",
            message: "Redeem promotions is not possible"
        });
    });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Hot beans app listening on port ${port}`);
});
