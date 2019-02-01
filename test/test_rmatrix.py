from ase import io
import numpy as np 

a = io.read('CHA.cif')
latt_cart = a.get_cell()

print np.dot(latt_cart, latt_cart.T)