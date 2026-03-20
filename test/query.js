'use strict';

import * as chai from 'chai';

import _ from 'lodash'
import {
    QueryParser as QueryParser
} from '../lib/query.js';

const expect = chai.expect;

// Create a test object for queries
var QuerySandbox = function(n) {
    this._nums = _.range(0, n);
}

QuerySandbox.prototype = {
    even: function() {
        return _.filter(this._nums, function(x) {
            return x % 2 == 0
        });
    },
    odd: function() {
        return _.filter(this._nums, function(x) {
            return x % 2 == 1
        });
    },
    all: function() {
        return _.cloneDeep(this._nums);
    },
    greater: function(val) {
        return _.filter(this._nums, function(x) {
            return x > val;
        });
    },
    lesser: function(val) {
        return _.filter(this._nums, function(x) {
            return x < val;
        });
    }
};

describe('#query', function() {
    it('should correctly parse an individual query', function() {
        var qs = new QuerySandbox(10);
        var qp = new QueryParser({
                'even': qs.even,
                'odd': qs.odd
            },
            qs);

        expect(qp.parse({
            'even': []
        })).to.deep.equal(_.range(0, 10, 2));
        expect(qp.parse({
            'odd': []
        })).to.deep.equal(_.range(1, 10, 2));
    });
    it('should correctly parse a query with arguments', function() {
        var qs = new QuerySandbox(10);
        var qp = new QueryParser({
                'greater': qs.greater
            },
            qs);

        expect(qp.parse({
            'greater': [2]
        })).to.deep.equal(_.range(3, 10));
    });
    it('should correctly use the operator $and', function() {
        var qs = new QuerySandbox(10);
        var qp = new QueryParser({
                'even': qs.even,
                'greater': qs.greater
            },
            qs);

        expect(qp.parse({
            '$and': [{
                'even': []
            }, {
                'greater': [2]
            }]
        })).to.deep.equal(_.range(4, 10, 2));
    });
    it('should correctly use the operator $or', function() {
        var qs = new QuerySandbox(10);
        var qp = new QueryParser({
                'even': qs.even,
                'odd': qs.odd
            },
            qs);

        expect(qp.parse({
            '$or': [{
                'even': []
            }, {
                'odd': []
            }]
        }).sort()).to.deep.equal(_.range(0, 10));
    });

    it('should correctly use the operator $xor', function() {
        var qs = new QuerySandbox(10);
        var qp = new QueryParser({
                'greater': qs.greater,
                'lesser': qs.lesser
            },
            qs);

        expect(qp.parse({
            '$xor': [{
                'greater': [0]
            }, {
                'lesser': [9]
            }]
        }).sort()).to.deep.equal([0, 9]);
    });

    it('should interpret a dictionary with multiple keys as $and queries', function() {

        var qs = new QuerySandbox(10);
        var qp = new QueryParser({
            'greater': qs.greater,
            'lesser': qs.lesser
        }, qs);

        expect(qp.parse({
            'greater': 2,
            'lesser': 6
        }).sort()).to.deep.equal([3, 4, 5]);

    });

});