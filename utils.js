const request = require('request');

const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const Datastore = require('nedb');
const gameSessions = new Datastore({
    filename: './db/gameSessions.db',
    autoload: true
});

const params = require('./private/params.json');

AWS.config.loadFromPath('./private/aws.json');

module.exports = {
    getDiscordInfos: code => {
        return new Promise((resolve, reject) => {
            request({
                uri: `${params.DiscordApiUrl}/oauth2/token`,
                method: 'post',
                form: {
                    client_id: params.DiscordClientId,
                    client_secret: params.DiscordClientSecret,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: params.DiscordReturnUrl,
                    scope: 'identify'
                },
                json: true
            }, (err, resp, body) => {
                if (err) return reject(err);
                request({
                    uri: `${params.DiscordApiUrl}/users/@me`,
                    headers: {
                        'Authorization':`Bearer ${body.access_token}`
                    },
                    json: true
                }, (err, resp, body) => {
                    if (err) reject(err);
                    resolve(body);
                });
            });
        });
    },

    findLastGameSession: () => new Promise((resolve, reject) => {
        gameSessions.findOne().sort({start:-1}).exec((err, session) => {
            resolve(session);
        });
    }),

    startGameSession: user => new Promise((resolve, reject) => {
        gameSessions.insert({
            player: `${user.username}#${user.discriminator}`,
            start: new Date(),
            end: null
        });
    }),

    endGameSession: () => new Promise((resolve, reject) => {
        gameSessions.update({end: null},{end: new Date()}).exec(() => {
            resolve();
        });
    }),

    listFile: () => new Promise((resolve, reject) => {
        S3.listObjectsV2({
            Bucket: params.AWSBucketName
        }, (err, data) => {
            if (err) return reject(err);
            else resolve(data.Contents);
        });
    }),

    downloadFile: () => {
        
    },

    uploadFile: () => {

    }
};