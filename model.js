const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let victims = new Schema(
    {
        ip: {
            type: String
        },
        range: {
            type: Array
        },
        country: {
            type: String
        },
        region: {
            type: String
        },
        eu: {
            type: String
        },
        timezone: {
            type: String
        },
        city: {
            type: String
        },
        ll: {
            type: Array
        },
        metro: {
            type: Number
        },
        area: {
            type: Number
        }
    }
)

module.exports = mongoose.model('victims', victims);