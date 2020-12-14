'use strict';

/** 
 * @fileoverview Class holding periodic table information
 * @package 
 */

var PeriodicTable = {
    "H": {
        "Z": 1,
        "vdwr": 1.2,
        "name": "Hydrogen"
    },
    "He": {
        "Z": 2,
        "vdwr": 1.43,
        "name": "Helium"
    },
    "Li": {
        "Z": 3,
        "vdwr": 2.12,
        "name": "Lithium"
    },
    "Be": {
        "Z": 4,
        "vdwr": 1.98,
        "name": "Beryllium"
    },
    "B": {
        "Z": 5,
        "vdwr": 1.91,
        "name": "Boron"
    },
    "C": {
        "Z": 6,
        "vdwr": 1.77,
        "name": "Carbon"
    },
    "N": {
        "Z": 7,
        "vdwr": 1.66,
        "name": "Nitrogen"
    },
    "O": {
        "Z": 8,
        "vdwr": 1.5,
        "name": "Oxygen"
    },
    "F": {
        "Z": 9,
        "vdwr": 1.46,
        "name": "Fluorine"
    },
    "Ne": {
        "Z": 10,
        "vdwr": 1.58,
        "name": "Neon"
    },
    "Na": {
        "Z": 11,
        "vdwr": 2.5,
        "name": "Sodium"
    },
    "Mg": {
        "Z": 12,
        "vdwr": 2.51,
        "name": "Magnesium"
    },
    "Al": {
        "Z": 13,
        "vdwr": 2.25,
        "name": "Aluminium"
    },
    "Si": {
        "Z": 14,
        "vdwr": 2.19,
        "name": "Silicon"
    },
    "P": {
        "Z": 15,
        "vdwr": 1.9,
        "name": "Phosphorus"
    },
    "S": {
        "Z": 16,
        "vdwr": 1.89,
        "name": "Sulfur"
    },
    "Cl": {
        "Z": 17,
        "vdwr": 1.82,
        "name": "Chlorine"
    },
    "Ar": {
        "Z": 18,
        "vdwr": 1.83,
        "name": "Argon"
    },
    "K": {
        "Z": 19,
        "vdwr": 2.73,
        "name": "Potassium"
    },
    "Ca": {
        "Z": 20,
        "vdwr": 2.62,
        "name": "Calcium"
    },
    "Sc": {
        "Z": 21,
        "vdwr": 2.58,
        "name": "Scandium"
    },
    "Ti": {
        "Z": 22,
        "vdwr": 2.46,
        "name": "Titanium"
    },
    "V": {
        "Z": 23,
        "vdwr": 2.42,
        "name": "Vanadium"
    },
    "Cr": {
        "Z": 24,
        "vdwr": 2.45,
        "name": "Chromium"
    },
    "Mn": {
        "Z": 25,
        "vdwr": 2.45,
        "name": "Manganese"
    },
    "Fe": {
        "Z": 26,
        "vdwr": 2.44,
        "name": "Iron"
    },
    "Co": {
        "Z": 27,
        "vdwr": 2.4,
        "name": "Cobalt"
    },
    "Ni": {
        "Z": 28,
        "vdwr": 2.4,
        "name": "Nickel"
    },
    "Cu": {
        "Z": 29,
        "vdwr": 2.38,
        "name": "Copper"
    },
    "Zn": {
        "Z": 30,
        "vdwr": 2.39,
        "name": "Zinc"
    },
    "Ga": {
        "Z": 31,
        "vdwr": 2.32,
        "name": "Gallium"
    },
    "Ge": {
        "Z": 32,
        "vdwr": 2.29,
        "name": "Germanium"
    },
    "As": {
        "Z": 33,
        "vdwr": 1.88,
        "name": "Arsenic"
    },
    "Se": {
        "Z": 34,
        "vdwr": 1.82,
        "name": "Selenium"
    },
    "Br": {
        "Z": 35,
        "vdwr": 1.86,
        "name": "Bromine"
    },
    "Kr": {
        "Z": 36,
        "vdwr": 2.25,
        "name": "Krypton"
    },
    "Rb": {
        "Z": 37,
        "vdwr": 3.21,
        "name": "Rubidium"
    },
    "Sr": {
        "Z": 38,
        "vdwr": 2.84,
        "name": "Strontium"
    },
    "Y": {
        "Z": 39,
        "vdwr": 2.75,
        "name": "Yttrium"
    },
    "Zr": {
        "Z": 40,
        "vdwr": 2.52,
        "name": "Zirconium"
    },
    "Nb": {
        "Z": 41,
        "vdwr": 2.56,
        "name": "Niobium"
    },
    "Mo": {
        "Z": 42,
        "vdwr": 2.45,
        "name": "Molybdenum"
    },
    "Tc": {
        "Z": 43,
        "vdwr": 2.44,
        "name": "Technetium"
    },
    "Ru": {
        "Z": 44,
        "vdwr": 2.46,
        "name": "Ruthenium"
    },
    "Rh": {
        "Z": 45,
        "vdwr": 2.44,
        "name": "Rhodium"
    },
    "Pd": {
        "Z": 46,
        "vdwr": 2.15,
        "name": "Palladium"
    },
    "Ag": {
        "Z": 47,
        "vdwr": 2.53,
        "name": "Silver"
    },
    "Cd": {
        "Z": 48,
        "vdwr": 2.49,
        "name": "Cadmium"
    },
    "In": {
        "Z": 49,
        "vdwr": 2.43,
        "name": "Indium"
    },
    "Sn": {
        "Z": 50,
        "vdwr": 2.42,
        "name": "Tin"
    },
    "Sb": {
        "Z": 51,
        "vdwr": 2.47,
        "name": "Antimony"
    },
    "Te": {
        "Z": 52,
        "vdwr": 1.99,
        "name": "Tellurium"
    },
    "I": {
        "Z": 53,
        "vdwr": 2.04,
        "name": "Iodine"
    },
    "Xe": {
        "Z": 54,
        "vdwr": 2.06,
        "name": "Xenon"
    },
    "Cs": {
        "Z": 55,
        "vdwr": 3.48,
        "name": "Caesium"
    },
    "Ba": {
        "Z": 56,
        "vdwr": 3.03,
        "name": "Barium"
    },
    "La": {
        "Z": 57,
        "vdwr": 2.98,
        "name": "Lanthanum"
    },
    "Ce": {
        "Z": 58,
        "vdwr": 2.88,
        "name": "Cerium"
    },
    "Pr": {
        "Z": 59,
        "vdwr": 2.92,
        "name": "Praseodymium"
    },
    "Nd": {
        "Z": 60,
        "vdwr": 2.95,
        "name": "Neodymium"
    },
    "Pm": {
        "Z": 61,
        "vdwr": NaN,
        "name": "Promethium"
    },
    "Sm": {
        "Z": 62,
        "vdwr": 2.9,
        "name": "Samarium"
    },
    "Eu": {
        "Z": 63,
        "vdwr": 2.87,
        "name": "Europium"
    },
    "Gd": {
        "Z": 64,
        "vdwr": 2.83,
        "name": "Gadolinium"
    },
    "Tb": {
        "Z": 65,
        "vdwr": 2.79,
        "name": "Terbium"
    },
    "Dy": {
        "Z": 66,
        "vdwr": 2.87,
        "name": "Dysprosium"
    },
    "Ho": {
        "Z": 67,
        "vdwr": 2.81,
        "name": "Holmium"
    },
    "Er": {
        "Z": 68,
        "vdwr": 2.83,
        "name": "Erbium"
    },
    "Tm": {
        "Z": 69,
        "vdwr": 2.79,
        "name": "Thulium"
    },
    "Yb": {
        "Z": 70,
        "vdwr": 2.8,
        "name": "Ytterbium"
    },
    "Lu": {
        "Z": 71,
        "vdwr": 2.74,
        "name": "Lutetium"
    },
    "Hf": {
        "Z": 72,
        "vdwr": 2.63,
        "name": "Hafnium"
    },
    "Ta": {
        "Z": 73,
        "vdwr": 2.53,
        "name": "Tantalum"
    },
    "W": {
        "Z": 74,
        "vdwr": 2.57,
        "name": "Tungsten"
    },
    "Re": {
        "Z": 75,
        "vdwr": 2.49,
        "name": "Rhenium"
    },
    "Os": {
        "Z": 76,
        "vdwr": 2.48,
        "name": "Osmium"
    },
    "Ir": {
        "Z": 77,
        "vdwr": 2.41,
        "name": "Iridium"
    },
    "Pt": {
        "Z": 78,
        "vdwr": 2.29,
        "name": "Platinum"
    },
    "Au": {
        "Z": 79,
        "vdwr": 2.32,
        "name": "Gold"
    },
    "Hg": {
        "Z": 80,
        "vdwr": 2.45,
        "name": "Mercury"
    },
    "Tl": {
        "Z": 81,
        "vdwr": 2.47,
        "name": "Thallium"
    },
    "Pb": {
        "Z": 82,
        "vdwr": 2.6,
        "name": "Lead"
    },
    "Bi": {
        "Z": 83,
        "vdwr": 2.54,
        "name": "Bismuth"
    },
    "Po": {
        "Z": 84,
        "vdwr": 1.97,
        "name": "Polonium"
    },
    "At": {
        "Z": 85,
        "vdwr": 2.02,
        "name": "Astatine"
    },
    "Rn": {
        "Z": 86,
        "vdwr": 2.2,
        "name": "Radon"
    },
    "Fr": {
        "Z": 87,
        "vdwr": 3.48,
        "name": "Francium"
    },
    "Ra": {
        "Z": 88,
        "vdwr": 2.83,
        "name": "Radium"
    },
    "Ac": {
        "Z": 89,
        "vdwr": 2.8,
        "name": "Actinium"
    },
    "Th": {
        "Z": 90,
        "vdwr": 2.93,
        "name": "Thorium"
    },
    "Pa": {
        "Z": 91,
        "vdwr": 2.88,
        "name": "Protactinium"
    },
    "U": {
        "Z": 92,
        "vdwr": 2.71,
        "name": "Uranium"
    },
    "Np": {
        "Z": 93,
        "vdwr": 2.82,
        "name": "Neptunium"
    },
    "Pu": {
        "Z": 94,
        "vdwr": 2.81,
        "name": "Plutonium"
    },
    "Am": {
        "Z": 95,
        "vdwr": 2.83,
        "name": "Americium"
    },
    "Cm": {
        "Z": 96,
        "vdwr": 3.05,
        "name": "Curium"
    },
    "Bk": {
        "Z": 97,
        "vdwr": 3.4,
        "name": "Berkelium"
    },
    "Cf": {
        "Z": 98,
        "vdwr": 3.05,
        "name": "Californium"
    },
    "Es": {
        "Z": 99,
        "vdwr": 2.7,
        "name": "Einsteinium"
    }
};

export {
    PeriodicTable
}