'use strict';

import * as chai from 'chai';
import chaiAlmost from 'chai-almost'

import {
    getVdwRadius,
    getIsotopeList,
    getElementData,
    getIsotopeData
} from '../lib/data.js';

chai.use(chaiAlmost(1e-3));

const expect = chai.expect;

describe('#nmrdata', function() {

    it('should find the right VdW radius for elements', function() {

        const vdwH = getVdwRadius('H');
        const vdwX = getVdwRadius('X'); // Unknown

        expect(vdwH).to.equal(1.2);
        expect(vdwX).to.equal(1.77);
    });

    it('should properly load the isotopes for a given element', function() {

        const isosH = getIsotopeList('H');
        const isosHe = getIsotopeList('He');

        expect(isosH).to.deep.equal(['1', '2']);
        expect(isosHe).to.deep.equal(['3', '4']);

    });

    it('should properly find the correct NMR data for an element', function() {

        const dataH = getElementData('H');

        expect(dataH.symbol).to.equal('H');
        expect(dataH.Z).to.equal(1);

        expect(dataH.maxiso).to.equal('1');
        expect(dataH.maxiso_NMR).to.equal('1');
        expect(dataH.maxiso_Q).to.equal('2');

    });

    it('should properly find the correct NMR data for an isotope', function() {

        const dataC12 = getIsotopeData('C'); // Most abundant C isotope
        const dataC13 = getIsotopeData('C', 'nmr'); // Most abundant NMR active one
        const dataCna = getIsotopeData('C', 'Q'); // Doesn't exist

        expect(dataC12.A).to.equal(12);
        expect(dataC13.A).to.equal(13);
        expect(dataCna).to.equal(null);

        const dataH2 = getIsotopeData('H', 'Q'); // Deuterium

        expect(dataH2.A).to.equal(2);
        expect(dataH2.spin).to.equal(1.0);
        expect(dataH2.gamma).to.almost.equal(41066279.1);
        expect(dataH2.Q).to.almost.equal(2.86);
         
    });
});