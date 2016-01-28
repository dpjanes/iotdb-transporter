/*
 *  errors.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-29
 *
 *  Copyright [2013-2016] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var assert = require('assert');
var util = require('util');

var MSG_NOT_AUTHORIZED = "not authorized";
var MSG_NOT_FOUND = "not found";
var MSG_NOT_RECIPE = "not a Recipe";
var MSG_NOT_APPROPRIATE = "action not available";
var MSG_TIMESTAMP_ERROR = "try again";

var CODE_NOT_AUTHORIZED = 401;
var CODE_NOT_FOUND = 404;
var CODE_NOT_RECIPE = 403;
var CODE_NOT_APPROPRIATE = 403;
var CODE_TIMESTAMP_ERROR = 409;

/**
 */
function NotFound(message) {
    Error.call(this);
    this.message = message || "not found";
    this.code = 404;
}

util.inherits(NotFound, Error);

/**
 */
function NotAuthorized(message) {
    Error.call(this);
    this.message = message || "not authorized";
    this.code = 401;
}

util.inherits(NotAuthorized, Error);

/**
 *  Timestanp was out of date
 */
function Timestamp(message) {
    Error.call(this);
    this.message = message || "timestamp out of date - try again";
    this.code = 409;
}

util.inherits(Timestamp, Error);

/**
 *  e.g. doing a PUT on a model
 */
function NotAppropriate(message) {
    Error.call(this);
    this.message = message || "action not available";
    this.code = 403;
}

util.inherits(NotAppropriate, Error);

/**
 *  e.g. expecting a thing and got a recipe
 */
function MethodNotAllowed(message) {
    Error.call(this);
    this.message = message || "method not allowed";
    this.code = 405;
}

util.inherits(MethodNotAllowed, Error);

/**
 *  API
 */
exports.NotFound = NotFound;
exports.NotAuthorized = NotAuthorized;
exports.Timestamp = Timestamp;
exports.NotAppropriate = NotAppropriate;
exports.MethodNotAllowed = MethodNotAllowed;
