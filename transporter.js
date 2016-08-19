/*
 *  transporter.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-23
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

const iotdb = require('iotdb');
const _ = iotdb._;
const errors = require('iotdb-errors');

const assert = require('assert');
const Rx = require('rx');

const logger = iotdb.logger({
    name: 'iotdb-transport',
    module: 'transporter',
});

const make = () => {
    const self = {
        rx: {},
        source: {},
    };

    // primary intereface
    self.list = d => {
        assert.ok(_.is.Dictionary(d) || _.is.Undefined(d), "d must be a Dictionary or Undefined");

        d = _.d.clone.deep(d || {});
        delete d.id;
        delete d.band;
        delete d.value;

        return Rx.Observable.create(observer => self.rx.list(observer, d));
    };
    self.added = d => {
        assert.ok(_.is.Dictionary(d) || _.is.Undefined(d), "d must be a Dictionary or Undefined");

        d = _.d.clone.deep(d || {});
        delete d.id;
        delete d.band;
        delete d.value;

        return Rx.Observable.create(observer => self.rx.added(observer, d));
    };
    self.updated = d => {
        assert.ok(_.is.Dictionary(d) || _.is.Undefined(d), "d must be a Dictionary or Undefined");

        d = _.d.clone.deep(d || {});
        delete d.value;

        return Rx.Observable.create(observer => self.rx.updated(observer, d));
    };
    self.put = d => {
        assert.ok(_.is.Dictionary(d), "d must be a Dictionary");
        assert.ok(_.is.String(d.id), "d.id must be a String");
        assert.ok(_.is.String(d.band), "d.band must be a String");
        assert.ok(_.is.Dictionary(d.value), "d.value must be a Dictionary");

        d = _.d.clone.deep(d);

        return Rx.Observable.create(observer => self.rx.put(observer, d));
    };
    self.get = d => {
        assert.ok(_.is.Dictionary(d), "d must be a Dictionary");
        assert.ok(_.is.String(d.id), "d.id must be a String");
        assert.ok(_.is.String(d.band), "d.band must be a String");

        d = _.d.clone.deep(d);
        delete d.value;

        return Rx.Observable.create(observer => self.rx.get(observer, d));
    };
    self.bands = d => {
        assert.ok(_.is.Dictionary(d), "d must be a Dictionary");
        assert.ok(_.is.String(d.id), "d.id must be a String");

        d = _.d.clone.deep(d || {});
        delete d.band;
        delete d.value;

        return Rx.Observable.create(observer => self.rx.bands(observer, d));
    };

    // use - this allows one transport to be the data source for another
    self.use = (source_transport, d) => {
        d = _.d.compose.shallow(d, {});

        _.keys(self.rx)
            .filter(key => d[key] !== false)
            .forEach(key => {
                self.rx[key] = source_transport.rx[key];
            })
    };

    // monitor - this takes all data from the source
    self.monitor = (source_transport, d) => {
        d = _.d.compose.shallow(d, {});

        if (d.all !== false) {
            source_transport
                .all({})
                .subscribe(
                    bandd => {
                        if (!bandd.id) {
                            return
                        }

                        _.mapObject(( value, band ) => {
                            if (!_.is.Dictionary(value)) {
                                return;
                            }

                            self.put({
                                id: bandd.id,
                                band: band,
                                value: value
                            }).subscribe(
                                x => {},
                                error => {
                                    console.log("HERE:MONITOR.ALL.PUT", error);
                                }
                            );
                        })
                    },
                    error => {
                        console.log("HERE:MONITOR.ALL.ERROR", error);
                    }
                );
        }

        if (d.updated !== false) {
            source_transport
                .updated({})
                .subscribe(
                    ud => {
                        self.put(ud).subscribe(
                            x => {},
                            error => {
                                console.log("HERE:MONITOR.UPDATED.PUT", error);
                            }
                        )
                    },
                    error => {
                        console.log("HERE:MONITOR.UPDATED", error);
                    }
                );
        }
    };

    // reactive interface - used by subclasses
    self.rx.list = (observer, d) => { throw errors.ShouldBeImplementedInSubclass(); };
    self.rx.added = (observer, d) => { throw errors.ShouldBeImplementedInSubclass(); };
    self.rx.updated = (observer, d) => { throw errors.ShouldBeImplementedInSubclass(); };
    self.rx.put = (observer, d) => { throw errors.ShouldBeImplementedInSubclass(); };
    self.rx.get = (observer, d) => { throw errors.ShouldBeImplementedInSubclass(); };
    self.rx.bands = (observer, d) => { throw errors.ShouldBeImplementedInSubclass(); };

    // helpers
    self.all = d => self.list(d)
        .selectMany(ld => self.bands(ld)
            .selectMany(bd => self.get(bd))
            .reduce((rd, gd) => {
                rd.id = gd.id;
                rd[gd.band] = gd.value;
                return rd;
            }, {})
        );


    return self;
};

/**
 *  API
 */
exports.make = make;