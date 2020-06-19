import numpy as np
import json
from ase.data import atomic_names, atomic_masses, chemical_symbols
from soprano.data.vdw import vdw_radii

ptable = {}

vdw = np.array(vdw_radii['csd'])

vdw = np.where(np.isnan(vdw), vdw_radii['ase'][:100], vdw)

for Z in range(1, len(vdw)):
	el = chemical_symbols[Z]
	ptable[el] = {
		'Z': Z,
		'vdwr': vdw[Z],
		'name': atomic_names[Z]
	}

with open('ptable.json', 'w') as f:
	json.dump(ptable, f, indent=4)
