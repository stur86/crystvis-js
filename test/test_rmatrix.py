from ase import io
import numpy as np 
from soprano.utils import minimum_supcell

max_r = 10
a = io.read('data/org.cif')
latt_cart = a.get_cell()

r_matrix = np.dot(latt_cart, latt_cart.T)

# print(r_matrix)

r_evals, r_evecs = np.linalg.eigh(r_matrix)

# for i in range(3):
#     print(r_evals[i], r_evecs[:,i])

# Unit sphere - to - ellipsoid transformation matrix
utransf_matrix = np.dot(r_evecs, np.diag(1.0/np.sqrt(r_evals)))
# To find the boundaries, we need to iterate over the three main
# directions. We do this implicitly though.
print(np.linalg.norm(utransf_matrix,
                                                        axis=1))
print(max_r*(utransf_matrix/np.linalg.norm(utransf_matrix,
                                                        axis=1)[:, None]).T)
qmatrix = np.dot(utransf_matrix,
                    max_r*(utransf_matrix/np.linalg.norm(utransf_matrix,
                                                        axis=1)[:, None]).T)
r_bounds = np.max(np.ceil(abs(qmatrix)), axis=1).astype(int)

print()
# print(qmatrix)
print(minimum_supcell(max_r, latt_cart))