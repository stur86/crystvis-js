'use strict';

/** 
 * @fileoverview Utility functions for queries across Models
 * @package 
 */

const _ = require('lodash');

/**
 * A parser for queries of any sort; it will recognize all queries whose names
 * are contained in 'methods', which optionally can belong to context;
 * will also recognize logical operators $and, $or and $xor.
 * @class
 * @param {Object}   methods    Dictionary of methods to be used for querying
 * @param {*}        context    Context for the methods above (namely, parent instance if they're class methods)
 * @param {Function} comparison Function used to compare two elements and check that they're identical. Must take
 *                              (x1, x2) as argument and return a bool.
 */
var QueryParser = function (methods, context, comparison) {
    this._methods = methods;
    this._context = context;
    this._comparison = comparison || function (x1, x2) { return x1 == x2; };
}

QueryParser.prototype = {
    /**
     * Parses and applies a query. The query comes in the form of a list, like:
     * 
     * ['name', '<argument1>', '<argument2>', ...]
     * 
     * where 'name' has to be contained in the methods table, and return a list of
     * results. Logical operators can be used, for example:
     * 
     * ['$and', [query1], [query2], ...]
     * 
     * will return the intersection of the various queries. The logical operators
     * are:
     * 
     * - $and : intersection of the results of the arguments
     * - $or  : sum of the results of the arguments
     * - $xor : sum minus intersection of the results of the arguments
     * 
     * @param {Array} query        The query to traverse
     * 
     * @returns {Array}            The outcome of the query
     */
    parse: function (query) {
        var name = query[0];
        if (name in this._methods) {
            // Then call the method
            return this._methods[name].apply(this._context, query.slice(1));
        }
        else switch (name) {
            case '$and':
                return this.and(query.slice(1));
            case '$or':
                return this.or(query.slice(1));
            case '$xor':
                return this.xor(query.slice(1));
            default:
                throw 'Invalid query: query name not recognized';
        }
    },

    and: function (queries) {
        var that = this;
        var result = this.parse(queries[0]);
        if (result == null) {
            return [];
        }
        for (var i = 1; i < queries.length; ++i) {
            var qres = this.parse(queries[i]);
            result = _.filter(result, function (v, i) {
                return qres.some(function (x) {
                    return that._comparison(v, x);
                });
            });
        }

        return result;
    },

    or: function(queries) {
        var that = this;
        var result = [];
        for (var i = 0; i < queries.length; ++i) {
            var qres = this.parse(queries[i]);
            qres = _.filter(qres, function (v, i) {
                return !result.some(function (x) {
                    return that._comparison(v, x);
                });
            });
            result = result.concat(qres);
        }

        return result;

    },

    xor: function(queries) {
        var that = this;
        var union = this.or(queries);
        var inter = this.and(queries);

        var result = _.filter(union, function(v, i) {
            return !inter.some(function(x) {
                return that._comparison(v, x);
            });
        });

        return result;
    }

}

exports.QueryParser = QueryParser;