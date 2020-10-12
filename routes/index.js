require('dotenv').config();

const express = require('express');
const Redis = require('ioredis');

const ensureHttps = require('../lib/middleware/ensure-https');
const themeCookie = require('../lib/middleware/theme-cookie');

const router = express.Router();

const redis = new Redis(process.env.REDIS_URL);

router
    .use(ensureHttps)
    .use(themeCookie)

    .get('/', async (req, res) => {
        res.render('timeline', {
            timeline: require('./sherlock.json')
        });
    })


    .get('/timeline/:id', async (req, res) => {
        try {
            const timeline = await redis.hgetall(`timeline:${req.params.id}`);
            res.render('timeline', { timeline });
        } catch (err) {
            console.log(err);
            res.redirect('/');
        }
    })

    .post('/timeline/:id', async (req, res) => {
        try {
            const data = req.body;
            await redis.hmset(`timeline:${req.params.id}`, data);
            res.sendStatus(200);
        } catch (err) {
            console.log(err);
            res.sendStatus(400);
        }
    })

    .get('/languages/:lang', (req, res) => {
        res.cookie('language', req.params.lang, { maxAge: 900000, httpOnly: true });
        res.redirect(req.header('Referer') || '/');
    })

    .get('/themes/:name', (req, res) => {
        res.cookie('theme', req.params.name, { maxAge: 900000, httpOnly: true });
        res.redirect(req.header('Referer') || '/');
    })
;

module.exports = router;
 