'use strict';

/** 
 * @fileoverview Utility functions for queries across Models
 * @module 
 */

import _ from 'lodash';

class QueryParser {

    /**
     * A parser for queries of any sort; it will recognize all queries whose names
     * are contained in 'methods', which optionally can belong to context;
     * will also recognize logical operators $and, $or and $xor.
     * @class
     * @param {Object}   methods    Dictionary of methods to be used for querying.
     * @param {*}        context    Context for the methods above (namely, parent instance if they're class methods)
     * @param {Function} comparison Function used to compare two elements and check that they're identical. Must take
     *                              (x1, x2) as argument and return a bool.
     */
    constructor(methods, context, comparison) {

        this._methods = methods;

        this._context = context;
        this._comparison = comparison || function(x1, x2) {
            return x1 == x2;
        };
    }

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
    parse(query) {

        var names = Object.keys(query);

        switch (names.length) {
            case 0:
                return [];
            case 1: {
                let name = names[0];
                let args = query[name];

                if (!(args instanceof Array)) {
                    args = [args]; // Just for a single argument
                }

                if (name in this._methods) {
                    // Then call the method
                    return this._methods[name].apply(this._context, args);
                } else switch (name) {
                    case '$and':
                        return this.and(args);
                    case '$or':
                        return this.or(args);
                    case '$xor':
                        return this.xor(args);
                    default:
                        throw new Error('Invalid query: query name not recognized');
                }
            }
            default: {
                let queries = _.map(query, (v, k) => {
                    var q = {};
                    q[k] = v;
                    return q;
                });
                return this.and(queries);
            }
        }
    }

    and(queries) {
        var that = this;
        var results = _.map(queries, function(q) {
            return that.parse(q)
        });
        var result = _.reduce(results.slice(1), function(r, v) {
            return _.intersectionWith(r, v, that._comparison);
        }, results[0]);

        return result;
    }

    or(queries) {
        var that = this;
        var results = _.map(queries, function(q) {
            return that.parse(q)
        });
        var result = _.reduce(results, function(r, v) {
            return _.unionWith(r, v, that._comparison);
        }, []);

        return result;
    }

    xor(queries) {
        var that = this;
        var results = _.map(queries, function(q) {
            return that.parse(q)
        });
        var result = _.reduce(results, function(r, v) {
            return _.xorWith(r, v, that._comparison);
        }, []);

        return result;
    }

}

export {
    QueryParser
}