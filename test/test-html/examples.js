'use strict';

// Convenience file to store the test input files as variables
var exampleFiles = {};

exampleFiles['si8.xyz'] = `8
Lattice="5.44 0.0 0.0 0.0 5.44 0.0 0.0 0.0 5.44" Properties=species:S:1:pos:R:3:spin:R:1 Time=0.0
Si        0.00000000      0.00000000      0.00000000    1.0
Si        1.36000000      1.36000000      1.36000000    0.0
Si        2.72000000      2.72000000      0.00000000    0.0
Si        4.08000000      4.08000000      1.36000000    0.0
Si        2.72000000      0.00000000      2.72000000    0.0
Si        4.08000000      1.36000000      4.08000000    0.0
Si        0.00000000      2.72000000      2.72000000    0.0
Si        1.36000000      4.08000000      4.08000000    0.0`;

exampleFiles['H2O.xyz'] = `6
Lattice="10.0 0.0 0.0 0.0 10.0 0.0 0.0 0.0 10.0" Properties=species:S:1:pos:R:3 pbc="T T T"
O        0.00000000       0.00000000       0.11926200
H        0.00000000       0.76323900      -0.47704700
H        0.00000000      -0.76323900      -0.47704700
O        5.00000000       0.00000000       0.11926200
H        5.00000000       0.76323900       9.522953
H        5.00000000       9.236761         9.522953`;

exampleFiles['org.cif'] = `#------------------------------------------------------------------------------
#$Date: 2016-02-18 17:37:37 +0200 (Thu, 18 Feb 2016) $
#$Revision: 176729 $
#$URL: svn://www.crystallography.net/cod/cif/1/50/19/1501936.cif $
#------------------------------------------------------------------------------
#
# This file is available in the Crystallography Open Database (COD),
# http://www.crystallography.net/
#
# All data on this site have been placed in the public domain by the
# contributors.
#
data_1501936
loop_
_publ_author_name
'Stewart, Craig'
'McDonald, Robert'
'West, F. G.'
_publ_section_title
;
 Expedient route to the tigliane-daphnane skeleton via oxonium ylide
 [1,2]-shift.
;
_journal_issue                   4
_journal_name_full               'Organic letters'
_journal_page_first              720
_journal_page_last               723
_journal_paper_doi               10.1021/ol102953s
_journal_volume                  13
_journal_year                    2011
_chemical_formula_moiety         'C21 H26 O4'
_chemical_formula_sum            'C21 H26 O4'
_chemical_formula_weight         342.42
_chemical_name_systematic
; 
 ? 
;
_space_group_IT_number           2
_symmetry_cell_setting           triclinic
_symmetry_space_group_name_Hall  '-P 1'
_symmetry_space_group_name_H-M   'P -1'
_atom_sites_solution_hydrogens   geom
_atom_sites_solution_primary     direct
_atom_sites_solution_secondary   difmap
_audit_creation_method           SHELXL-97
_cell_angle_alpha                79.9846(4)
_cell_angle_beta                 82.2194(4)
_cell_angle_gamma                77.7988(4)
_cell_formula_units_Z            2
_cell_length_a                   8.2302(3)
_cell_length_b                   8.2837(3)
_cell_length_c                   13.1837(4)
_cell_measurement_reflns_used    7347
_cell_measurement_temperature    173(2)
_cell_measurement_theta_max      27.48
_cell_measurement_theta_min      2.54
_cell_volume                     860.57(5)
_computing_cell_refinement       'Bruker SAINT'
_computing_data_collection       'Bruker APEX2'
_computing_data_reduction        'Bruker SAINT'
_computing_molecular_graphics    'Bruker SHELXTL'
_computing_publication_material  'Bruker SHELXTL'
_computing_structure_refinement  'SHELXL-97 (Sheldrick, 2008)'
_computing_structure_solution    'SHELXD (Schneider & Sheldrick, 2002)'
_diffrn_ambient_temperature      173(2)
_diffrn_measured_fraction_theta_full 0.986
_diffrn_measured_fraction_theta_max 0.986
_diffrn_measurement_device_type  'Bruker APEX-II CCD'
_diffrn_measurement_method       '\f and \w scans'
_diffrn_radiation_monochromator  graphite
_diffrn_radiation_source         'fine-focus sealed tube'
_diffrn_radiation_type           MoK\a
_diffrn_radiation_wavelength     0.71073
_diffrn_reflns_av_R_equivalents  0.0099
_diffrn_reflns_av_sigmaI/netI    0.0146
_diffrn_reflns_limit_h_max       10
_diffrn_reflns_limit_h_min       -10
_diffrn_reflns_limit_k_max       10
_diffrn_reflns_limit_k_min       -10
_diffrn_reflns_limit_l_max       17
_diffrn_reflns_limit_l_min       -17
_diffrn_reflns_number            7543
_diffrn_reflns_theta_full        27.48
_diffrn_reflns_theta_max         27.48
_diffrn_reflns_theta_min         1.58
_exptl_absorpt_coefficient_mu    0.090
_exptl_absorpt_correction_T_max  0.9723
_exptl_absorpt_correction_T_min  0.9471
_exptl_absorpt_correction_type   integration
_exptl_absorpt_process_details   'SADABS (Sheldrick, 2008)'
_exptl_crystal_colour            colourless
_exptl_crystal_density_diffrn    1.321
_exptl_crystal_density_method    'not measured'
_exptl_crystal_description       prism
_exptl_crystal_F_000             368
_exptl_crystal_size_max          0.61
_exptl_crystal_size_mid          0.35
_exptl_crystal_size_min          0.31
_refine_diff_density_max         0.347
_refine_diff_density_min         -0.262
_refine_diff_density_rms         0.054
_refine_ls_extinction_method     none
_refine_ls_goodness_of_fit_ref   1.029
_refine_ls_hydrogen_treatment    constr
_refine_ls_matrix_type           full
_refine_ls_number_parameters     227
_refine_ls_number_reflns         3894
_refine_ls_number_restraints     0
_refine_ls_restrained_S_all      1.029
_refine_ls_R_factor_all          0.0447
_refine_ls_R_factor_gt           0.0418
_refine_ls_shift/su_max          0.000
_refine_ls_shift/su_mean         0.000
_refine_ls_structure_factor_coef Fsqd
_refine_ls_weighting_details
'calc w=1/[\s^2^(Fo^2^)+(0.0666P)^2^+0.2631P] where P=(Fo^2^+2Fc^2^)/3'
_refine_ls_weighting_scheme      calc
_refine_ls_wR_factor_gt          0.1105
_refine_ls_wR_factor_ref         0.1138
_reflns_number_gt                3564
_reflns_number_total             3894
_reflns_threshold_expression     I>2\s(I)
_cod_data_source_file            ol102953s_si_002.cif
_cod_data_source_block           16
_cod_depositor_comments
;
The following automatic conversions were performed:

'_symmetry_cell_setting' value 'Triclinic' changed to 'triclinic'
according to /home/saulius/struct/CIF-dictionaries/cif_core.dic
dictionary named 'cif_core.dic' version 2.4.1 from 2010-06-29.

Automatic conversion script
Id: cif_fix_values 1715 2011-07-08 13:25:40Z adriana 
;
_cod_database_code               1501936
loop_
_symmetry_equiv_pos_as_xyz
'x, y, z'
'-x, -y, -z'
loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_U_iso_or_equiv
_atom_site_adp_type
_atom_site_occupancy
_atom_site_symmetry_multiplicity
_atom_site_calc_flag
_atom_site_refinement_flags
O1 O 0.43325(9) 0.00289(10) 0.22205(6) 0.02475(18) Uani 1 1 d .
O2 O 0.25690(11) 0.06668(12) 0.48190(6) 0.0318(2) Uani 1 1 d .
H2O H 0.1572 0.0969 0.4682 0.048 Uiso 1 1 calc R
O3 O 0.03180(9) 0.07400(10) 0.35068(6) 0.02243(18) Uani 1 1 d .
O4 O -0.05742(9) 0.12277(10) 0.18848(6) 0.02204(18) Uani 1 1 d .
C1 C 0.23130(16) 0.31699(15) 0.05350(9) 0.0292(3) Uani 1 1 d .
H1A H 0.1668 0.2801 0.0066 0.035 Uiso 1 1 calc R
H1B H 0.1966 0.4394 0.0512 0.035 Uiso 1 1 calc R
C2 C 0.41826(17) 0.26953(18) 0.02240(10) 0.0362(3) Uani 1 1 d .
H2A H 0.4570 0.3551 -0.0324 0.043 Uiso 1 1 calc R
H2B H 0.4466 0.1600 -0.0026 0.043 Uiso 1 1 calc R
C3 C 0.49496(16) 0.26142(18) 0.12251(10) 0.0346(3) Uani 1 1 d .
H3A H 0.5020 0.3746 0.1340 0.041 Uiso 1 1 calc R
H3B H 0.6086 0.1915 0.1204 0.041 Uiso 1 1 calc R
C4 C 0.37765(13) 0.18364(14) 0.20769(9) 0.0236(2) Uani 1 1 d .
C5 C 0.37169(15) 0.22671(15) 0.31723(9) 0.0278(2) Uani 1 1 d .
H5A H 0.2716 0.3123 0.3326 0.033 Uiso 1 1 calc R
H5B H 0.4728 0.2685 0.3250 0.033 Uiso 1 1 calc R
C6 C 0.36401(14) 0.05939(14) 0.38863(9) 0.0249(2) Uani 1 1 d .
H6 H 0.4795 0.0130 0.4087 0.030 Uiso 1 1 calc R
C7 C 0.33164(13) -0.05107(13) 0.31315(8) 0.0221(2) Uani 1 1 d .
H7 H 0.3766 -0.1709 0.3390 0.026 Uiso 1 1 calc R
C8 C 0.14955(13) -0.03284(13) 0.28705(8) 0.0200(2) Uani 1 1 d .
C9 C 0.09823(15) -0.20349(14) 0.30165(9) 0.0274(2) Uani 1 1 d .
H9A H 0.1342 -0.2692 0.3677 0.033 Uiso 1 1 calc R
H9B H -0.0251 -0.1870 0.3061 0.033 Uiso 1 1 calc R
C10 C 0.17450(18) -0.30157(15) 0.21329(10) 0.0335(3) Uani 1 1 d .
H10A H 0.2980 -0.3217 0.2093 0.040 Uiso 1 1 calc R
H10B H 0.1393 -0.4111 0.2257 0.040 Uiso 1 1 calc R
C11 C 0.11557(18) -0.20110(15) 0.11223(10) 0.0320(3) Uani 1 1 d .
H11A H -0.0079 -0.1821 0.1166 0.038 Uiso 1 1 calc R
H11B H 0.1615 -0.2652 0.0546 0.038 Uiso 1 1 calc R
C12 C 0.17208(14) -0.03337(14) 0.09030(8) 0.0243(2) Uani 1 1 d .
H12A H 0.2952 -0.0536 0.0750 0.029 Uiso 1 1 calc R
H12B H 0.1235 0.0326 0.0277 0.029 Uiso 1 1 calc R
C13 C 0.12298(12) 0.06918(12) 0.17872(8) 0.0190(2) Uani 1 1 d .
C14 C 0.20338(13) 0.22587(13) 0.16509(8) 0.0210(2) Uani 1 1 d .
H14 H 0.1286 0.3076 0.2067 0.025 Uiso 1 1 calc R
C15 C -0.11096(13) 0.13931(14) 0.29369(8) 0.0222(2) Uani 1 1 d .
H15 H -0.1989 0.0710 0.3197 0.027 Uiso 1 1 calc R
C16 C -0.17827(13) 0.31719(14) 0.31250(9) 0.0246(2) Uani 1 1 d .
C17 C -0.21011(15) 0.44865(15) 0.23268(10) 0.0285(2) Uani 1 1 d .
H17 H -0.1901 0.4287 0.1628 0.034 Uiso 1 1 calc R
C18 C -0.27164(16) 0.61039(16) 0.25492(11) 0.0356(3) Uani 1 1 d .
H18 H -0.2950 0.7001 0.2001 0.043 Uiso 1 1 calc R
C19 C -0.29871(16) 0.64062(17) 0.35582(12) 0.0402(3) Uani 1 1 d .
H19 H -0.3359 0.7515 0.3706 0.048 Uiso 1 1 calc R
C20 C -0.2715(2) 0.5084(2) 0.43574(13) 0.0532(4) Uani 1 1 d .
H20 H -0.2928 0.5283 0.5056 0.064 Uiso 1 1 calc R
C21 C -0.2133(2) 0.34710(19) 0.41411(11) 0.0450(4) Uani 1 1 d .
H21 H -0.1973 0.2566 0.4692 0.054 Uiso 1 1 calc R
loop_
_atom_site_aniso_label
_atom_site_aniso_U_11
_atom_site_aniso_U_22
_atom_site_aniso_U_33
_atom_site_aniso_U_23
_atom_site_aniso_U_13
_atom_site_aniso_U_12
O1 0.0204(4) 0.0269(4) 0.0259(4) -0.0057(3) -0.0017(3) -0.0012(3)
O2 0.0315(4) 0.0438(5) 0.0215(4) -0.0075(4) -0.0049(3) -0.0067(4)
O3 0.0201(4) 0.0270(4) 0.0189(4) -0.0043(3) -0.0034(3) 0.0000(3)
O4 0.0195(4) 0.0265(4) 0.0204(4) -0.0038(3) -0.0048(3) -0.0031(3)
C1 0.0362(6) 0.0255(5) 0.0262(6) 0.0017(4) -0.0051(5) -0.0101(5)
C2 0.0391(7) 0.0386(7) 0.0290(6) 0.0001(5) 0.0050(5) -0.0127(5)
C3 0.0282(6) 0.0416(7) 0.0349(6) -0.0006(5) 0.0006(5) -0.0155(5)
C4 0.0217(5) 0.0248(5) 0.0253(5) -0.0034(4) -0.0030(4) -0.0068(4)
C5 0.0307(6) 0.0285(6) 0.0277(6) -0.0061(4) -0.0078(4) -0.0092(4)
C6 0.0234(5) 0.0292(6) 0.0230(5) -0.0055(4) -0.0074(4) -0.0028(4)
C7 0.0214(5) 0.0223(5) 0.0218(5) -0.0028(4) -0.0056(4) -0.0008(4)
C8 0.0213(5) 0.0196(5) 0.0191(5) -0.0029(4) -0.0035(4) -0.0031(4)
C9 0.0341(6) 0.0219(5) 0.0272(6) 0.0021(4) -0.0083(5) -0.0093(4)
C10 0.0480(7) 0.0194(5) 0.0349(6) -0.0034(5) -0.0132(5) -0.0058(5)
C11 0.0472(7) 0.0235(6) 0.0294(6) -0.0073(4) -0.0117(5) -0.0083(5)
C12 0.0299(5) 0.0235(5) 0.0205(5) -0.0059(4) -0.0041(4) -0.0040(4)
C13 0.0188(5) 0.0189(5) 0.0196(5) -0.0026(4) -0.0039(4) -0.0027(4)
C14 0.0219(5) 0.0200(5) 0.0217(5) -0.0024(4) -0.0034(4) -0.0051(4)
C15 0.0188(5) 0.0261(5) 0.0212(5) -0.0015(4) -0.0033(4) -0.0038(4)
C16 0.0187(5) 0.0278(5) 0.0268(5) -0.0059(4) -0.0028(4) -0.0020(4)
C17 0.0250(5) 0.0286(6) 0.0312(6) -0.0035(5) -0.0044(4) -0.0032(4)
C18 0.0289(6) 0.0276(6) 0.0484(8) -0.0032(5) -0.0076(5) -0.0008(5)
C19 0.0284(6) 0.0338(7) 0.0599(9) -0.0201(6) -0.0106(6) 0.0049(5)
C20 0.0639(10) 0.0522(9) 0.0397(8) -0.0233(7) -0.0113(7) 0.0147(8)
C21 0.0585(9) 0.0408(8) 0.0282(7) -0.0085(6) -0.0068(6) 0.0113(6)
loop_
_atom_type_symbol
_atom_type_description
_atom_type_scat_dispersion_real
_atom_type_scat_dispersion_imag
_atom_type_scat_source
C C 0.0033 0.0016 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'
H H 0.0000 0.0000 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'
O O 0.0106 0.0060 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'
loop_
_geom_angle_atom_site_label_1
_geom_angle_atom_site_label_2
_geom_angle_atom_site_label_3
_geom_angle
C7 O1 C4 102.79(8)
C15 O3 C8 106.30(7)
C15 O4 C13 107.90(7)
C2 C1 C14 105.14(9)
C1 C2 C3 103.37(10)
C2 C3 C4 105.12(10)
O1 C4 C3 108.63(9)
O1 C4 C5 103.13(9)
C3 C4 C5 117.53(10)
O1 C4 C14 108.27(8)
C3 C4 C14 105.59(9)
C5 C4 C14 113.35(9)
C4 C5 C6 103.88(9)
O2 C6 C5 116.61(10)
O2 C6 C7 117.45(10)
C5 C6 C7 102.19(9)
O1 C7 C6 100.99(9)
O1 C7 C8 109.50(8)
C6 C7 C8 118.01(9)
O3 C8 C9 108.90(9)
O3 C8 C13 99.92(8)
C9 C8 C13 113.17(9)
O3 C8 C7 111.63(8)
C9 C8 C7 111.12(9)
C13 C8 C7 111.61(8)
C10 C9 C8 112.28(10)
C11 C10 C9 108.77(10)
C10 C11 C12 110.83(10)
C13 C12 C11 114.11(9)
O4 C13 C12 108.21(8)
O4 C13 C8 100.85(8)
C12 C13 C8 114.25(8)
O4 C13 C14 108.43(8)
C12 C13 C14 114.66(9)
C8 C13 C14 109.39(8)
C1 C14 C13 116.60(9)
C1 C14 C4 105.76(9)
C13 C14 C4 111.64(8)
O4 C15 O3 107.05(8)
O4 C15 C16 114.21(9)
O3 C15 C16 108.24(8)
C17 C16 C21 119.43(11)
C17 C16 C15 122.58(10)
C21 C16 C15 117.97(11)
C16 C17 C18 119.94(12)
C19 C18 C17 120.39(12)
C18 C19 C20 119.60(13)
C19 C20 C21 120.19(14)
C16 C21 C20 120.35(13)
loop_
_geom_bond_atom_site_label_1
_geom_bond_atom_site_label_2
_geom_bond_distance
O1 C7 1.4286(13)
O1 C4 1.4568(13)
O2 C6 1.4152(14)
O3 C15 1.4376(12)
O3 C8 1.4498(12)
O4 C15 1.4184(13)
O4 C13 1.4518(12)
C1 C2 1.5232(18)
C1 C14 1.5436(15)
C2 C3 1.5236(19)
C3 C4 1.5252(16)
C4 C5 1.5387(15)
C4 C14 1.5597(14)
C5 C6 1.5422(16)
C6 C7 1.5459(15)
C7 C8 1.5534(14)
C8 C9 1.5328(15)
C8 C13 1.5454(14)
C9 C10 1.5254(17)
C10 C11 1.5237(17)
C11 C12 1.5256(16)
C12 C13 1.5217(14)
C13 C14 1.5507(14)
C15 C16 1.5115(15)
C16 C17 1.3847(16)
C16 C21 1.3854(17)
C17 C18 1.3954(17)
C18 C19 1.376(2)
C19 C20 1.385(2)
C20 C21 1.386(2)
loop_
_geom_hbond_atom_site_label_D
_geom_hbond_atom_site_label_H
_geom_hbond_atom_site_label_A
_geom_hbond_distance_DH
_geom_hbond_distance_HA
_geom_hbond_distance_DA
_geom_hbond_angle_DHA
O2 H2O O3 0.84 2.03 2.6856(11) 134.4
loop_
_geom_torsion_atom_site_label_1
_geom_torsion_atom_site_label_2
_geom_torsion_atom_site_label_3
_geom_torsion_atom_site_label_4
_geom_torsion
C14 C1 C2 C3 -36.03(12)
C1 C2 C3 C4 38.59(13)
C7 O1 C4 C3 171.08(9)
C7 O1 C4 C5 45.66(10)
C7 O1 C4 C14 -74.71(10)
C2 C3 C4 O1 90.00(11)
C2 C3 C4 C5 -153.50(11)
C2 C3 C4 C14 -25.95(13)
O1 C4 C5 C6 -19.76(11)
C3 C4 C5 C6 -139.21(10)
C14 C4 C5 C6 97.07(10)
C4 C5 C6 O2 -140.12(9)
C4 C5 C6 C7 -10.64(11)
C4 O1 C7 C6 -52.55(9)
C4 O1 C7 C8 72.65(10)
O2 C6 C7 O1 167.08(9)
C5 C6 C7 O1 38.13(10)
O2 C6 C7 C8 47.83(13)
C5 C6 C7 C8 -81.11(11)
C15 O3 C8 C9 -81.23(10)
C15 O3 C8 C13 37.59(9)
C15 O3 C8 C7 155.72(8)
O1 C7 C8 O3 -122.30(9)
C6 C7 C8 O3 -7.63(13)
O1 C7 C8 C9 115.92(10)
C6 C7 C8 C9 -129.40(10)
O1 C7 C8 C13 -11.42(12)
C6 C7 C8 C13 103.25(11)
O3 C8 C9 C10 160.32(9)
C13 C8 C9 C10 50.17(12)
C7 C8 C9 C10 -76.32(11)
C8 C9 C10 C11 -59.99(13)
C9 C10 C11 C12 60.93(14)
C10 C11 C12 C13 -53.49(14)
C15 O4 C13 C12 150.64(9)
C15 O4 C13 C8 30.42(9)
C15 O4 C13 C14 -84.43(9)
C11 C12 C13 O4 -68.27(11)
C11 C12 C13 C8 43.17(13)
C11 C12 C13 C14 170.58(9)
O3 C8 C13 O4 -40.93(9)
C9 C8 C13 O4 74.70(10)
C7 C8 C13 O4 -159.07(8)
O3 C8 C13 C12 -156.73(8)
C9 C8 C13 C12 -41.11(12)
C7 C8 C13 C12 85.12(11)
O3 C8 C13 C14 73.20(9)
C9 C8 C13 C14 -171.18(9)
C7 C8 C13 C14 -44.95(11)
C2 C1 C14 C13 -104.72(11)
C2 C1 C14 C4 20.01(12)
O4 C13 C14 C1 -86.70(11)
C12 C13 C14 C1 34.33(13)
C8 C13 C14 C1 164.18(9)
O4 C13 C14 C4 151.61(8)
C12 C13 C14 C4 -87.37(11)
C8 C13 C14 C4 42.48(11)
O1 C4 C14 C1 -112.58(9)
C3 C4 C14 C1 3.62(12)
C5 C4 C14 C1 133.64(10)
O1 C4 C14 C13 15.19(11)
C3 C4 C14 C13 131.38(10)
C5 C4 C14 C13 -98.59(10)
C13 O4 C15 O3 -7.90(10)
C13 O4 C15 C16 111.90(9)
C8 O3 C15 O4 -20.10(10)
C8 O3 C15 C16 -143.65(9)
O4 C15 C16 C17 9.96(15)
O3 C15 C16 C17 129.09(11)
O4 C15 C16 C21 -171.89(11)
O3 C15 C16 C21 -52.76(14)
C21 C16 C17 C18 2.13(19)
C15 C16 C17 C18 -179.75(10)
C16 C17 C18 C19 0.94(19)
C17 C18 C19 C20 -2.8(2)
C18 C19 C20 C21 1.6(3)
C17 C16 C21 C20 -3.3(2)
C15 C16 C21 C20 178.47(14)
C19 C20 C21 C16 1.5(3)
`

exampleFiles['example_single.cif'] = `#########################################################################
#                                   #
#           THIS IS AN EXAMPLE OF A CIF REPORTING A SINGLE      #
#       STRUCTURE AND INCLUDING USER-DEFINABLE TEXT         #
#       SECTIONS                            #
#                                   #
#########################################################################

data_global

loop_
_publ_body_element
_publ_body_title
_publ_body_contents

 section . 
;
?
;
 section 
;
Introduction
; 
;\
INTRODUCTION TEXT HERE
;
 section Experimental 
;
?
;
 subsection 'Synthesis and crystallization'
;
TEXT HERE
;

 subsection Refinement
;
TEXT HERE
;

 section 'Results and discussion'
;
TEXT HERE
;

#=============================================================

_audit_creation_date        'June 17, 2013'
_audit_creation_method      'from SHELXL-97'
_audit_update_record
;
;

#===================================================================
# 1. SUBMISSION DETAILS

_publ_contact_author_name       'NAME'
_publ_contact_author_address
;
ADDRESS
;

_publ_contact_author_phone      ?
_publ_contact_author_fax        ?
_publ_contact_author_email      ?

_publ_requested_journal         'Acta Crystallographica C'
_publ_requested_category        FA
_publ_requested_coeditor_name   ?

_publ_contact_letter
;
;

#=====================================================================
# 2. PROCESSING SUMMARY  (IUCr Office Use Only)

_journal_date_recd_electronic     ?
_journal_date_to_coeditor         ?
_journal_date_from_coeditor       ?
_journal_date_accepted            ?
_journal_date_printers_first      ?
_journal_date_printers_final      ?
_journal_date_proofs_out          ?
_journal_date_proofs_in           ?
_journal_coeditor_name            ?
_journal_coeditor_code            ?
_journal_paper_doi                ?
_journal_paper_category           FA
_journal_coeditor_notes           ?
_journal_techeditor_code          ?
_iucr_compatibility_tag           ACTA95
_journal_techeditor_notes         ?
_journal_coden_ASTM               ACSCGG
_journal_name_full                'Acta Crystallographica, Section C'
_journal_year                     ?
_journal_volume                   ?
_journal_issue                    ?
_journal_page_first               ?
_journal_page_last                ?
_journal_suppl_publ_number        ?
_journal_suppl_publ_pages         ?

#=====================================================================
# 3. TITLE AND AUTHOR LIST

_publ_section_title
;
TITLE
;

loop_
_publ_author_name
_publ_author_address
_publ_author_email
_publ_author_footnote
'NAME'
;  
ADDRESS
;
? ?

#======================================================================
# 4. TEXT

_publ_section_synopsis
;
TEXT HERE
;

_publ_section_keywords
;
TEXT HERE
;

_publ_section_abstract
;
TEXT HERE
;

_publ_section_references
;
REFERENCES HERE
;

_publ_section_figure_captions  
;
FIGURE CAPTIONS HERE
;

_publ_section_table_legends
;
TABLE CAPTIONS HERE
;

_publ_section_acknowledgements
;
ACKNOWLEDGEMENTS HERE
;

#=====================================================================

data_I

#=====================================================================
# 5. Chemical Data

_chemical_name_systematic
;\
(6<i>R</i>*,11<i>R</i>*)-5-Acetyl-11-ethyl-6,11-dihydro-5<i>H</i>-\
dibenzo[<i>b</i>,<i>e</i>]azepine-6-carboxylic acid
;
_chemical_name_common             ?
_chemical_melting_point           ?
_chemical_formula_moiety          'C19 H19 N O3' 
_chemical_formula_sum             'C19 H19 N O3' 
_chemical_formula_weight          309.35 
_chemical_compound_source         'synthesised by authors, see text'
_chemical_formula_iupac           'C19 H19 N O3' 

loop_
 _atom_type_symbol
 _atom_type_description
 _atom_type_scat_dispersion_real
 _atom_type_scat_dispersion_imag
 _atom_type_scat_source
 'C'  'C'   0.0033   0.0016
 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'
 'H'  'H'   0.0000   0.0000
 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4' 
 'N'  'N'   0.0061   0.0033
 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'
 'O'  'O'   0.0106   0.0060
 'International Tables Vol C Tables 4.2.6.8 and 6.1.1.4'


_symmetry_cell_setting            monoclinic
_symmetry_space_group_name_H-M    'P 21'
_symmetry_space_group_name_Hall   'P 2yb'

loop_
 _symmetry_equiv_pos_as_xyz
'x, y, z' 
 '-x, y+1/2, -z' 

_cell_length_a                    8.8053(3) 
_cell_length_b                    10.9821(4) 
_cell_length_c                    9.0080(6) 
_cell_angle_alpha                 90.00 
_cell_angle_beta                  118.510(3) 
_cell_angle_gamma                 90.00 
_cell_volume                      765.45(6) 
_cell_formula_units_Z             2 
_cell_measurement_temperature     120(2)
_cell_measurement_reflns_used     1853
_cell_measurement_theta_min       3.20
_cell_measurement_theta_max       27.50

_exptl_crystal_description        rod
_exptl_crystal_colour             colourless
_exptl_crystal_size_max           0.26
_exptl_crystal_size_mid           0.14
_exptl_crystal_size_min           0.10
_exptl_crystal_density_meas       ?
_exptl_crystal_density_diffrn     1.342
_exptl_crystal_density_method     'not measured'
_exptl_crystal_F_000              328
_exptl_absorpt_coefficient_mu     0.091
_exptl_absorpt_correction_type    multi-scan
_exptl_absorpt_process_details    '(SADABS; Sheldrick, 2003)'
_exptl_absorpt_correction_T_min   0.977
_exptl_absorpt_correction_T_max   0.991

_exptl_special_details
?

_diffrn_ambient_temperature       120(2)
_diffrn_radiation_wavelength      0.71073
_diffrn_radiation_type            'Mo K\a'
_diffrn_radiation_source          'Bruker Nonius FR591 rotating anode'
_diffrn_radiation_monochromator   graphite
_diffrn_measurement_device_type   'Bruker Nonius KappaCCD area-detector'
_diffrn_measurement_method        '\f and \w'
_diffrn_detector_area_resol_mean  9.091
_diffrn_standards_interval_count  0
_diffrn_standards_interval_time   0
_diffrn_standards_number          0
_diffrn_standards_decay_%         0

_diffrn_reflns_number             13276 
_diffrn_reflns_av_R_equivalents   0.0486 
_diffrn_reflns_av_sigmaI/netI     0.0321 
_diffrn_reflns_limit_h_min       -11 
_diffrn_reflns_limit_h_max        11 
_diffrn_reflns_limit_k_min       -14 
_diffrn_reflns_limit_k_max        14 
_diffrn_reflns_limit_l_min       -11 
_diffrn_reflns_limit_l_max        11 
_diffrn_reflns_theta_min          3.71
_diffrn_reflns_theta_max          27.50
_diffrn_reflns_theta_full              27.50
_diffrn_measured_fraction_theta_max    0.997
_diffrn_measured_fraction_theta_full   0.997
_reflns_number_total              1851
_reflns_number_gt                 1638
_reflns_threshold_expression      I>2\s(I)

_computing_data_collection        'COLLECT (Nonius, 1998)' 
_computing_cell_refinement        
'DIRAX/LSQ (Duisenberg <i>et al.</i>, 2000)'
_computing_data_reduction         
'EVALCCD (Duisenberg <i>et al.</i>, 2003)'
_computing_structure_solution     'SIR2004 (Burla et al., 2005)'
_computing_structure_refinement   'SHELXL97 (Sheldrick, 2008)'  
_computing_molecular_graphics     'PLATON (Spek, 2009)'
_computing_publication_material 
'SHELXL97 (Sheldrick, 2008) and PLATON (Spek, 2009)'

#=========================================================================
# 8. Refinement Data

_refine_ls_structure_factor_coef  Fsqd
_refine_ls_matrix_type            full
_refine_ls_weighting_scheme       calc
_refine_ls_weighting_details
'w = 1/[\s^2^(Fo^2^)+(0.0351P)^2^+0.1657P] where P=(Fo^2^+2Fc^2^)/3' 
_atom_sites_solution_primary      direct
_atom_sites_solution_secondary    difmap
_atom_sites_solution_hydrogens    geom
_refine_ls_hydrogen_treatment     constr
_refine_ls_extinction_method      none
_refine_ls_extinction_coef        ?
_chemical_absolute_configuration  unk
_refine_ls_number_reflns          1851 
_refine_ls_number_parameters      210 
_refine_ls_number_restraints      1 
_refine_ls_R_factor_all           0.0455 
_refine_ls_R_factor_gt            0.0360 
_refine_ls_wR_factor_ref          0.0807 
_refine_ls_wR_factor_gt           0.0772 
_refine_ls_goodness_of_fit_ref    1.146 
_refine_ls_restrained_S_all       1.146 
_refine_ls_shift/su_max           0.001
_refine_ls_shift/su_mean          0.000
_refine_diff_density_max          0.209
_refine_diff_density_min         -0.240

#=========================================================================
# 9. Atomic Coordinates and Displacement Parameters

loop_
 _atom_site_label
 _atom_site_type_symbol
 _atom_site_fract_x
 _atom_site_fract_y
 _atom_site_fract_z
 _atom_site_U_iso_or_equiv
 _atom_site_adp_type
 _atom_site_occupancy
 _atom_site_symmetry_multiplicity
 _atom_site_calc_flag
 _atom_site_refinement_flags
 _atom_site_disorder_assembly
 _atom_site_disorder_group
C1 C 0.6424(3) 0.5942(2) 0.7939(3) 0.0186(5) Uani 1 1 d . . . 
H1 H 0.6599 0.6154 0.9031 0.022 Uiso 1 1 calc R . . 
C2 C 0.7828(3) 0.5595(2) 0.7731(3) 0.0211(5) Uani 1 1 d . . . 
H2 H 0.8953 0.5589 0.8678 0.025 Uiso 1 1 calc R . . 
C3 C 0.7604(3) 0.5255(2) 0.6149(3) 0.0202(5) Uani 1 1 d . . . 
H3 H 0.8563 0.4993 0.6019 0.024 Uiso 1 1 calc R . . 
C4 C 0.5955(3) 0.5306(2) 0.4757(3) 0.0166(5) Uani 1 1 d . . . 
H4 H 0.5780 0.5079 0.3669 0.020 Uiso 1 1 calc R . . 
C4a C 0.4576(3) 0.5687(2) 0.4973(3) 0.0142(5) Uani 1 1 d . . . 
N5 N 0.2883(2) 0.58197(17) 0.3533(2) 0.0132(4) Uani 1 1 d . . . 
C6 C 0.1469(3) 0.4966(2) 0.3244(3) 0.0128(4) Uani 1 1 d . . . 
H6 H 0.0389 0.5461 0.2831 0.015 Uiso 1 1 calc R . . 
C6a C 0.1714(3) 0.4295(2) 0.4842(3) 0.0145(5) Uani 1 1 d . . . 
C7 C 0.1243(3) 0.3077(2) 0.4737(3) 0.0174(5) Uani 1 1 d . . . 
H7 H 0.0884 0.2652 0.3704 0.021 Uiso 1 1 calc R . . 
C8 C 0.1286(3) 0.2465(2) 0.6107(3) 0.0189(5) Uani 1 1 d . . . 
H8 H 0.0977 0.1628 0.6008 0.023 Uiso 1 1 calc R . . 
C9 C 0.1780(3) 0.3073(2) 0.7616(3) 0.0188(5) Uani 1 1 d . . . 
H9 H 0.1759 0.2670 0.8540 0.023 Uiso 1 1 calc R . . 
C10 C 0.2305(3) 0.4277(2) 0.7762(3) 0.0185(5) Uani 1 1 d . . . 
H10 H 0.2674 0.4685 0.8808 0.022 Uiso 1 1 calc R . . 
C10a C 0.2307(3) 0.4909(2) 0.6412(3) 0.0151(5) Uani 1 1 d . . . 
C11 C 0.3097(3) 0.6185(2) 0.6677(3) 0.0150(5) Uani 1 1 d . . . 
H11 H 0.2307 0.6694 0.5686 0.018 Uiso 1 1 calc R . . 
C11a C 0.4763(3) 0.5982(2) 0.6566(3) 0.0145(5) Uani 1 1 d . . . 
C51 C 0.2534(3) 0.6720(2) 0.2388(3) 0.0142(5) Uani 1 1 d . . . 
O51 O 0.10670(19) 0.68043(16) 0.11339(19) 0.0180(4) Uani 1 1 d . . . 
C52 C 0.3950(3) 0.7609(2) 0.2675(3) 0.0189(5) Uani 1 1 d . . . 
H52A H 0.4784 0.7219 0.2397 0.028 Uiso 1 1 calc R . . 
H52B H 0.4537 0.7862 0.3862 0.028 Uiso 1 1 calc R . . 
H52C H 0.3452 0.8324 0.1952 0.028 Uiso 1 1 calc R . . 
C61 C 0.1208(3) 0.4093(2) 0.1806(3) 0.0145(5) Uani 1 1 d . . . 
O61 O -0.0387(2) 0.36474(17) 0.10291(19) 0.0186(4) Uani 1 1 d . . . 
H61 H -0.0487 0.3107 0.0297 0.028 Uiso 1 1 d R . . 
O62 O 0.2327(2) 0.38608(17) 0.1438(2) 0.0224(4) Uani 1 1 d . . . 
C111 C 0.3325(3) 0.6837(2) 0.8280(3) 0.0202(5) Uani 1 1 d . . . 
H11A H 0.2247 0.6761 0.8362 0.024 Uiso 1 1 calc R . . 
H11B H 0.4266 0.6440 0.9284 0.024 Uiso 1 1 calc R . . 
C112 C 0.3752(3) 0.8181(2) 0.8272(3) 0.0229(5) Uani 1 1 d . . . 
H12A H 0.4821 0.8260 0.8195 0.034 Uiso 1 1 calc R . . 
H12B H 0.3905 0.8565 0.9317 0.034 Uiso 1 1 calc R . . 
H12C H 0.2804 0.8583 0.7300 0.034 Uiso 1 1 calc R . . 

loop_
 _atom_site_aniso_label
 _atom_site_aniso_U_11
 _atom_site_aniso_U_22
 _atom_site_aniso_U_33
 _atom_site_aniso_U_23
 _atom_site_aniso_U_13
 _atom_site_aniso_U_12
C1 0.0214(12) 0.0168(12) 0.0133(11) -0.0003(10) 0.0048(10) -0.0021(10) 
C2 0.0163(12) 0.0170(13) 0.0222(13) 0.0035(10) 0.0027(10) -0.0025(9) 
C3 0.0158(11) 0.0198(13) 0.0252(13) 0.0052(10) 0.0101(11) 0.0018(10) 
C4 0.0191(11) 0.0145(12) 0.0168(11) 0.0012(9) 0.0091(10) -0.0002(9) 
C4a 0.0138(11) 0.0128(12) 0.0136(11) 0.0021(9) 0.0045(10) -0.0010(8) 
N5 0.0120(9) 0.0137(10) 0.0117(9) 0.0010(8) 0.0038(8) -0.0010(7) 
C6 0.0117(10) 0.0148(11) 0.0113(10) -0.0002(9) 0.0049(9) -0.0006(8) 
C6a 0.0133(11) 0.0176(12) 0.0136(11) 0.0004(9) 0.0071(9) 0.0010(9) 
C7 0.0156(11) 0.0201(12) 0.0151(11) -0.0019(9) 0.0061(9) -0.0004(9) 
C8 0.0177(12) 0.0162(12) 0.0217(12) 0.0009(10) 0.0085(10) -0.0028(10) 
C9 0.0173(12) 0.0222(13) 0.0183(12) 0.0054(10) 0.0097(10) 0.0008(10) 
C10 0.0172(12) 0.0242(13) 0.0135(11) -0.0006(10) 0.0069(10) 0.0020(10) 
C10a 0.0125(10) 0.0167(11) 0.0162(11) 0.0002(9) 0.0068(9) 0.0006(9) 
C11 0.0152(11) 0.0167(12) 0.0135(11) -0.0015(9) 0.0073(9) -0.0009(9) 
C11a 0.0184(12) 0.0098(10) 0.0156(11) 0.0006(9) 0.0083(10) -0.0010(9) 
C51 0.0168(11) 0.0142(11) 0.0121(11) -0.0020(9) 0.0074(9) 0.0004(9) 
O51 0.0161(8) 0.0186(9) 0.0150(8) 0.0025(7) 0.0040(7) 0.0005(7) 
C52 0.0207(12) 0.0162(12) 0.0194(12) 0.0029(10) 0.0092(10) -0.0010(10) 
C61 0.0176(11) 0.0127(11) 0.0117(10) 0.0022(9) 0.0058(9) 0.0001(9) 
O61 0.0176(8) 0.0213(9) 0.0150(8) -0.0065(7) 0.0062(7) -0.0045(7) 
O62 0.0221(9) 0.0252(10) 0.0241(9) -0.0062(8) 0.0144(8) -0.0024(7) 
C111 0.0243(12) 0.0195(13) 0.0176(12) -0.0036(11) 0.0106(10) -0.0018(11) 
C112 0.0265(13) 0.0208(13) 0.0248(13) -0.0065(10) 0.0151(11) -0.0031(10) 

#=========================================================================
# 10. Molecular Geometry

loop_
 _geom_bond_atom_site_label_1
 _geom_bond_atom_site_label_2
 _geom_bond_distance
 _geom_bond_site_symmetry_2
 _geom_bond_publ_flag
C1 C2 1.388(4) . ? 
C1 C11a 1.395(3) . ? 
C1 H1 0.9500 . ? 
C2 C3 1.393(4) . ? 
C2 H2 0.9500 . ? 
C3 C4 1.395(3) . ? 
C3 H3 0.9500 . ? 
C4 C4a 1.383(3) . ? 
C4 H4 0.9500 . ? 
C4a C11a 1.402(3) . ? 
C4a N5 1.442(3) . ? 
N5 C51 1.354(3) . ? 
N5 C6 1.479(3) . ? 
C6 C6a 1.538(3) . ? 
C6 C61 1.538(3) . ? 
C6 H6 1.0000 . ? 
C6a C7 1.390(3) . ? 
C6a C10a 1.423(3) . ? 
C7 C8 1.390(3) . ? 
C7 H7 0.9500 . ? 
C8 C9 1.386(3) . ? 
C8 H8 0.9500 . ? 
C9 C10 1.386(3) . ? 
C9 H9 0.9500 . ? 
C10 C10a 1.401(3) . ? 
C10 H10 0.9500 . ? 
C10a C11 1.532(3) . ? 
C11 C11a 1.533(3) . ? 
C11 C111 1.536(3) . ? 
C11 H11 1.0000 . ? 
C51 O51 1.249(3) . ? 
C51 C52 1.506(3) . ? 
C52 H52A 0.9800 . ? 
C52 H52B 0.9800 . ? 
C52 H52C 0.9800 . ? 
C61 O62 1.207(3) . ? 
C61 O61 1.328(3) . ? 
O61 H61 0.8602 . ? 
C111 C112 1.523(4) . ? 
C111 H11A 0.9900 . ? 
C111 H11B 0.9900 . ? 
C112 H12A 0.9800 . ? 
C112 H12B 0.9800 . ? 
C112 H12C 0.9800 . ? 

loop_
 _geom_angle_atom_site_label_1
 _geom_angle_atom_site_label_2
 _geom_angle_atom_site_label_3
 _geom_angle
 _geom_angle_site_symmetry_1
 _geom_angle_site_symmetry_3
 _geom_angle_publ_flag
C2 C1 C11a 120.9(2) . . ? 
C2 C1 H1 119.5 . . ? 
C11a C1 H1 119.5 . . ? 
C1 C2 C3 120.7(2) . . ? 
C1 C2 H2 119.6 . . ? 
C3 C2 H2 119.6 . . ? 
C2 C3 C4 119.1(2) . . ? 
C2 C3 H3 120.4 . . ? 
C4 C3 H3 120.4 . . ? 
C4a C4 C3 119.6(2) . . ? 
C4a C4 H4 120.2 . . ? 
C3 C4 H4 120.2 . . ? 
C4 C4a C11a 122.1(2) . . ? 
C4 C4a N5 120.27(19) . . ? 
C11a C4a N5 117.61(19) . . ? 
C51 N5 C4a 121.36(18) . . ? 
C51 N5 C6 117.57(18) . . ? 
C4a N5 C6 121.06(17) . . ? 
N5 C6 C6a 114.16(18) . . ? 
N5 C6 C61 108.54(17) . . ? 
C6a C6 C61 112.80(19) . . ? 
N5 C6 H6 107.0 . . ? 
C6a C6 H6 107.0 . . ? 
C61 C6 H6 107.0 . . ? 
C7 C6a C10a 118.7(2) . . ? 
C7 C6a C6 119.6(2) . . ? 
C10a C6a C6 121.6(2) . . ? 
C8 C7 C6a 121.6(2) . . ? 
C8 C7 H7 119.2 . . ? 
C6a C7 H7 119.2 . . ? 
C9 C8 C7 120.0(2) . . ? 
C9 C8 H8 120.0 . . ? 
C7 C8 H8 120.0 . . ? 
C8 C9 C10 119.2(2) . . ? 
C8 C9 H9 120.4 . . ? 
C10 C9 H9 120.4 . . ? 
C9 C10 C10a 122.0(2) . . ? 
C9 C10 H10 119.0 . . ? 
C10a C10 H10 119.0 . . ? 
C10 C10a C6a 118.4(2) . . ? 
C10 C10a C11 120.5(2) . . ? 
C6a C10a C11 120.8(2) . . ? 
C10a C11 C11a 103.51(18) . . ? 
C10a C11 C111 114.78(19) . . ? 
C11a C11 C111 115.41(19) . . ? 
C10a C11 H11 107.6 . . ? 
C11a C11 H11 107.6 . . ? 
C111 C11 H11 107.6 . . ? 
C1 C11a C4a 117.4(2) . . ? 
C1 C11a C11 125.3(2) . . ? 
C4a C11a C11 116.87(19) . . ? 
O51 C51 N5 120.3(2) . . ? 
O51 C51 C52 121.4(2) . . ? 
N5 C51 C52 118.30(19) . . ? 
C51 C52 H52A 109.5 . . ? 
C51 C52 H52B 109.5 . . ? 
H52A C52 H52B 109.5 . . ? 
C51 C52 H52C 109.5 . . ? 
H52A C52 H52C 109.5 . . ? 
H52B C52 H52C 109.5 . . ? 
O62 C61 O61 125.0(2) . . ? 
O62 C61 C6 123.3(2) . . ? 
O61 C61 C6 111.64(18) . . ? 
C61 O61 H61 110.7 . . ? 
C112 C111 C11 111.7(2) . . ? 
C112 C111 H11A 109.3 . . ? 
C11 C111 H11A 109.3 . . ? 
C112 C111 H11B 109.3 . . ? 
C11 C111 H11B 109.3 . . ? 
H11A C111 H11B 108.0 . . ? 
C111 C112 H12A 109.5 . . ? 
C111 C112 H12B 109.5 . . ? 
H12A C112 H12B 109.5 . . ? 
C111 C112 H12C 109.5 . . ? 
H12A C112 H12C 109.5 . . ? 
H12B C112 H12C 109.5 . . ? 

loop_
 _geom_torsion_atom_site_label_1
 _geom_torsion_atom_site_label_2
 _geom_torsion_atom_site_label_3
 _geom_torsion_atom_site_label_4
 _geom_torsion
 _geom_torsion_site_symmetry_1
 _geom_torsion_site_symmetry_2
 _geom_torsion_site_symmetry_3
 _geom_torsion_site_symmetry_4
 _geom_torsion_publ_flag
C11a C1 C2 C3 -1.3(4) . . . . ? 
C1 C2 C3 C4 2.1(4) . . . . ? 
C2 C3 C4 C4a -0.1(4) . . . . ? 
C3 C4 C4a C11a -2.7(4) . . . . ? 
C3 C4 C4a N5 176.0(2) . . . . ? 
C4 C4a N5 C51 -70.0(3) . . . . ? 
C11a C4a N5 C51 108.7(2) . . . . ? 
C4 C4a N5 C6 109.3(2) . . . . ? 
C11a C4a N5 C6 -72.0(3) . . . . ? 
C51 N5 C6 C6a -158.55(19) . . . . ? 
C4a N5 C6 C6a 22.1(3) . . . . ? 
C51 N5 C6 C61 74.7(2) . . . . ? 
C4a N5 C6 C61 -104.7(2) . . . . ? 
N5 C6 C6a C7 -141.2(2) . . . . ? 
C61 C6 C6a C7 -16.7(3) . . . . ? 
N5 C6 C6a C10a 42.9(3) . . . . ? 
C61 C6 C6a C10a 167.43(19) . . . . ? 
C10a C6a C7 C8 2.2(3) . . . . ? 
C6 C6a C7 C8 -173.8(2) . . . . ? 
C6a C7 C8 C9 1.0(4) . . . . ? 
C7 C8 C9 C10 -3.0(3) . . . . ? 
C8 C9 C10 C10a 1.8(3) . . . . ? 
C9 C10 C10a C6a 1.4(3) . . . . ? 
C9 C10 C10a C11 -172.7(2) . . . . ? 
C7 C6a C10a C10 -3.4(3) . . . . ? 
C6 C6a C10a C10 172.6(2) . . . . ? 
C7 C6a C10a C11 170.7(2) . . . . ? 
C6 C6a C10a C11 -13.4(3) . . . . ? 
C10 C10a C11 C11a 108.4(2) . . . . ? 
C6a C10a C11 C11a -65.6(3) . . . . ? 
C10 C10a C11 C111 -18.3(3) . . . . ? 
C6a C10a C11 C111 167.7(2) . . . . ? 
C2 C1 C11a C4a -1.4(3) . . . . ? 
C2 C1 C11a C11 171.5(2) . . . . ? 
C4 C4a C11a C1 3.4(3) . . . . ? 
N5 C4a C11a C1 -175.3(2) . . . . ? 
C4 C4a C11a C11 -170.1(2) . . . . ? 
N5 C4a C11a C11 11.2(3) . . . . ? 
C10a C11 C11a C1 -103.1(3) . . . . ? 
C111 C11 C11a C1 23.1(4) . . . . ? 
C10a C11 C11a C4a 69.8(2) . . . . ? 
C111 C11 C11a C4a -163.9(2) . . . . ? 
C4a N5 C51 O51 178.7(2) . . . . ? 
C6 N5 C51 O51 -0.7(3) . . . . ? 
C4a N5 C51 C52 -1.5(3) . . . . ? 
C6 N5 C51 C52 179.1(2) . . . . ? 
N5 C6 C61 O62 24.4(3) . . . . ? 
C6a C6 C61 O62 -103.1(3) . . . . ? 
N5 C6 C61 O61 -155.01(18) . . . . ? 
C6a C6 C61 O61 77.5(2) . . . . ? 
C10a C11 C111 C112 -168.0(2) . . . . ? 
C11a C11 C111 C112 71.7(3) . . . . ? 

loop_
 _geom_hbond_atom_site_label_D
 _geom_hbond_atom_site_label_H
 _geom_hbond_atom_site_label_A
 _geom_hbond_distance_DH
 _geom_hbond_distance_HA
 _geom_hbond_distance_DA
 _geom_hbond_angle_DHA
 _geom_hbond_site_symmetry_A
 _geom_hbond_publ_flag
#
# Hydrogen bonding scheme
# ======== ======= ======
#
# D   H    A   D-H   H...A  D...A    D-H...A  symm  publ
# -   -    -   ---   -----  -----    -------  ----  ----
 O61  H61  O51 0.86  1.83   2.672(2) 167      2_545 no
 C2   H2   O51 0.95  2.49   3.309(3) 144      1_656 no
 C112 H12A O62 0.98  2.46   3.418(4) 165      2_656 no

#======================================================================


_iucr_refine_instructions_details
;
TITL CM45F8
CELL  0.71073   8.8053  10.9821   9.0080   90.000  118.510   90.000
ZERR     2.00   0.0003   0.0004   0.0006    0.000    0.003    0.000
LATT  -1
SYMM  - X, 1/2 + Y, - Z
SFAC  C    H    N    O
UNIT  38   38   2    6
MERG   4
OMIT    -2.00 55.00
FMAP   2
PLAN   20
SIZE     0.10   0.14   0.26
ACTA
BOND   $H
CONF
HTAB
OMIT 1 1 0
OMIT -1 1 1
LIST   4
L.S.   8
TEMP  -153.00
WGHT    0.035100    0.165700
FVAR       1.39751
C1    1    0.642443    0.594154    0.793875    11.00000    0.02140    0.01683 =
         0.01327   -0.00034    0.00478   -0.00213
AFIX  43
H1    2    0.659873    0.615425    0.903129    11.00000   -1.20000
AFIX   0
C2    1    0.782781    0.559463    0.773119    11.00000    0.01629    0.01699 =
         0.02217    0.00353    0.00273   -0.00253
AFIX  43
H2    2    0.895282    0.558863    0.867841    11.00000   -1.20000
AFIX   0
C3    1    0.760432    0.525515    0.614880    11.00000    0.01584    0.01980 =
         0.02524    0.00519    0.01015    0.00176
AFIX  43
H3    2    0.856262    0.499287    0.601936    11.00000   -1.20000
AFIX   0
C4    1    0.595473    0.530554    0.475729    11.00000    0.01912    0.01446 =
         0.01678    0.00125    0.00906   -0.00022
AFIX  43
H4    2    0.577979    0.507917    0.366895    11.00000   -1.20000
AFIX   0
C4a   1    0.457563    0.568724    0.497261    11.00000    0.01382    0.01282 =
         0.01356    0.00214    0.00450   -0.00103
N5    3    0.288314    0.581975    0.353266    11.00000    0.01198    0.01373 =
         0.01166    0.00100    0.00383   -0.00105
C6    1    0.146917    0.496600    0.324411    11.00000    0.01169    0.01480 =
         0.01126   -0.00015    0.00490   -0.00064
AFIX  13
H6    2    0.038938    0.546079    0.283111    11.00000   -1.20000
AFIX   0
C6a   1    0.171355    0.429513    0.484153    11.00000    0.01329    0.01757 =
         0.01355    0.00044    0.00709    0.00104
C7    1    0.124326    0.307677    0.473724    11.00000    0.01560    0.02008 =
         0.01506   -0.00192    0.00609   -0.00038
AFIX  43
H7    2    0.088369    0.265234    0.370398    11.00000   -1.20000
AFIX   0
C8    1    0.128614    0.246451    0.610695    11.00000    0.01770    0.01619 =
         0.02174    0.00087    0.00851   -0.00276
AFIX  43
H8    2    0.097654    0.162826    0.600826    11.00000   -1.20000
AFIX   0
C9    1    0.178015    0.307296    0.761647    11.00000    0.01733    0.02220 =
         0.01834    0.00538    0.00971    0.00082
AFIX  43
H9    2    0.175933    0.267006    0.853983    11.00000   -1.20000
AFIX   0
C10   1    0.230502    0.427676    0.776204    11.00000    0.01718    0.02418 =
         0.01352   -0.00059    0.00685    0.00203
AFIX  43
H10   2    0.267411    0.468531    0.880811    11.00000   -1.20000
AFIX   0
C10a  1    0.230749    0.490913    0.641243    11.00000    0.01246    0.01667 =
         0.01623    0.00016    0.00684    0.00056
C11   1    0.309683    0.618540    0.667747    11.00000    0.01523    0.01672 =
         0.01353   -0.00154    0.00732   -0.00093
AFIX  13
H11   2    0.230748    0.669420    0.568637    11.00000   -1.20000
AFIX   0
C11a  1    0.476255    0.598216    0.656614    11.00000    0.01843    0.00976 =
         0.01565    0.00055    0.00829   -0.00105
 
C51   1    0.253368    0.672019    0.238787    11.00000    0.01680    0.01421 =
         0.01210   -0.00198    0.00743    0.00042
O51   4    0.106700    0.680430    0.113386    11.00000    0.01608    0.01859 =
         0.01499    0.00249    0.00402    0.00048
C52   1    0.395047    0.760869    0.267480    11.00000    0.02070    0.01620 =
         0.01940    0.00286    0.00916   -0.00096
AFIX 137
H52A  2    0.478434    0.721879    0.239710    11.00000   -1.50000
H52B  2    0.453745    0.786182    0.386198    11.00000   -1.50000
H52C  2    0.345169    0.832372    0.195207    11.00000   -1.50000
AFIX   0
 
C61   1    0.120819    0.409307    0.180594    11.00000    0.01761    0.01275 =
         0.01168    0.00224    0.00579    0.00012
O61   4   -0.038667    0.364738    0.102914    11.00000    0.01765    0.02128 =
         0.01495   -0.00650    0.00617   -0.00452
AFIX   3
H61   2   -0.048669    0.310674    0.029683    11.00000   -1.50000
AFIX   0
O62   4    0.232707    0.386081    0.143759    11.00000    0.02212    0.02519 =
         0.02409   -0.00624    0.01436   -0.00241
 
C111  1    0.332488    0.683745    0.827992    11.00000    0.02428    0.01948 =
         0.01756   -0.00357    0.01064   -0.00184
AFIX  23
H11A  2    0.224713    0.676059    0.836195    11.00000   -1.20000
H11B  2    0.426599    0.644010    0.928445    11.00000   -1.20000
AFIX   0
C112  1    0.375182    0.818096    0.827218    11.00000    0.02653    0.02084 =
         0.02483   -0.00653    0.01506   -0.00313
AFIX 137
H12A  2    0.482058    0.825982    0.819501    11.00000   -1.50000
H12B  2    0.390518    0.856476    0.931702    11.00000   -1.50000
H12C  2    0.280435    0.858256    0.729953    11.00000   -1.50000
HKLF 4
 
REM  CM45F8
REM R1 =  0.0360 for   1638 Fo > 4sig(Fo)  and  0.0455 for all   1851 data
REM    210 parameters refined using      1 restraints
 
END  
     
WGHT      0.0351      0.1657 
REM Highest difference peak  0.209,  deepest hole -0.240,  1-sigma level  0.047
Q1    1   0.1374  0.4513  0.2451  11.00000  0.05    0.21
Q2    1   0.5006  0.7306  0.7023  11.00000  0.05    0.18
Q3    1   0.2063  0.4551  0.5588  11.00000  0.05    0.18
Q4    1   0.2180  0.5354  0.3391  11.00000  0.05    0.17
Q5    1   0.6831  0.6851  0.9667  11.00000  0.05    0.17
Q6    1   0.0732  0.0693  0.6018  11.00000  0.05    0.17
Q7    1   0.6020  0.8659  0.3678  11.00000  0.05    0.17
Q8    1   0.5105  0.9084  0.2589  11.00000  0.05    0.16
Q9    1   0.5204  0.7451  0.5750  11.00000  0.05    0.16
Q10   1   0.4683  0.5985  0.5722  11.00000  0.05    0.16
Q11   1   0.6412  0.7835  0.4017  11.00000  0.05    0.15
Q12   1   0.1569  0.5382  0.0448  11.00000  0.05    0.15
Q13   1   0.4688  0.7959  0.5012  11.00000  0.05    0.15
Q14   1   0.7544  0.4002  0.4802  11.00000  0.05    0.15
Q15   1   0.5796  0.8187  0.5697  11.00000  0.05    0.15
Q16   1   0.3044  0.2205  0.6197  11.00000  0.05    0.15
Q17   1   0.1886  0.2243  1.0318  11.00000  0.05    0.15
Q18   1   0.2287  0.7530  0.4991  11.00000  0.05    0.14
Q19   1   0.8512  0.4325  0.9053  11.00000  0.05    0.14
Q20   1   0.5138  0.7749  0.3766  11.00000  0.05    0.14
;

# start Validation Reply Form
_vrf_PUBL005_GLOBAL
;
PROBLEM: _publ_contact_author_email, _publ_contact_author_fax and
RESPONSE: Example CIF
;
# end Validation Reply Form

#======================================================================
#                         END of CIF
#======================================================================

`

exampleFiles['ethanol.magres'] = `#$magres-abinitio-v1.0
# Generated by format.py. For format definition and code samples see http://www.ccpnc.ac.uk/pmwiki.php/CCPNC/Fileformat
[calculation]
calc_code CASTEP
calc_code_version 7.0
calc_comment 
calc_kpoint_mp_grid 1 1 1
calc_code_hgversion 0d37235409d7+ magres-efg 2013-02-07
calc_cutoffenergy 4.0000000000000000E+01
calc_xcfunctional PBE
calc_kpoint_mp_offset 0.25000000 0.25000000 0.25000000
calc_code_platform linux_x86_64_ifort12
units calc_cutoffenergy Hartree
calc_name ethanol
[/calculation]
[atoms]
  units lattice Angstrom
  units atom Angstrom
  lattice 6.0 0.0 0.0 0.0 6.0 0.0 0.0 0.0 6.0
  symmetry P1
atom    H   H   1   2.129659    2.823711    2.349943
atom    H   H   2   3.182454    2.075799    3.559623
atom    H   H   3   3.86813 3.197626    2.370217
atom    H   H   4   1.869295    3.974874    4.564773
atom    H   H   5   2.561231    5.078941    3.371865
atom    H   H   6   4.060671    3.677653    5.297066
atom    C   C   1   2.996   2.996   2.996
atom    C   C   2   2.752085    4.164107    3.937396
atom    O   O   1   3.895314    4.458074    4.741964
[/atoms]
[magres]
  units sus 10^-6.cm^3.mol^-1
  units ms ppm
  units efg au
  units isc_fc 10^19.T^2.J^-1
  units isc 10^19.T^2.J^-1
  sus 1   0   0   0   1   0   0   0   1
  ms H 1 30.2981796159 1.2051069281 3.67274492938 1.96313294552 27.5765250451 2.57545224195 4.21834131673 2.16271307552 30.9031525163
  ms H 2 26.9742092612 -0.420221330647 0.603628166501 -0.387611330052 35.3313827464 -1.80447967738 -0.578564493964 -1.44841641969 28.4625610177
  ms H 3 29.9943370458 0.804017870839 -3.41596793698 -0.538358436872 27.8109854077 -0.130246475692 -3.56604211569 -0.0418632950686 32.5029379989
  ms H 4 32.2898154856 0.584330480731 -1.63639006642 0.778952021344 22.6711049351 1.80797334282 -0.0810936558433 2.01393309009 25.9791612443
  ms H 5 25.946849893 -2.77588906551 3.75442739434 -1.77463107727 29.7225814726 -0.398037457666 3.04599241075 -1.46601607492 26.5018075671
  ms H 6 28.6085193533 -2.06023026024 4.73450589133 -0.308253194156 32.9520121318 -6.48661920164 4.68678352951 -5.89383717672 34.3943957639
  ms C 1 150.363398078 -10.1551572591 -0.228392095331 0.262621541636 160.896219614 23.0932964082 7.6058979745 15.6796898709 158.142036855
  ms C 2 133.676840084 0.262423773157 30.3803502689 3.67357096609 87.087341646 13.766471363 33.4352726046 12.5980254544 108.80723859
  ms O 1 246.617726076 4.67835886314 23.439961146 -25.5598430959 289.39716395 -21.152670085 18.297484257 -4.25541343242 268.070670505
  efg_local H 1 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
  efg_local H 2 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
  efg_local H 3 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
  efg_local H 4 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
  efg_local H 5 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
  efg_local H 6 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0
  efg_local C 1 -0.0250863245422 -0.0201770085446 -0.00412773044863 -0.0201770085446 0.019590013125 0.034603122236 -0.00412773044863 0.034603122236 0.00549631141718
  efg_local C 2 0.18069118986 0.0616787382743 0.26613664065 0.0616787382743 -0.179575675203 0.11466220516 0.26613664065 0.11466220516 -0.00111551465673
  efg_local O 1 0.118861288007 0.135560088603 1.49199510969 0.135560088603 0.0010287580134 -0.861525967236 1.49199510969 -0.861525967236 -0.11989004602
  efg_nonlocal H 1 -0.248884029127 -0.15886792949 -0.510061683836 -0.15886792949 0.31790645627 -0.164617997629 -0.510061683836 -0.164617997629 -0.0690224271437
  efg_nonlocal H 2 0.413666682454 0.14659469133 -0.101224264464 0.14659469133 -0.557394043688 0.377626548075 -0.101224264464 0.377626548075 0.143727361235
  efg_nonlocal H 3 -0.240472505532 -0.1201678195 0.512637552144 -0.1201678195 0.352737517928 0.0258286832003 0.512637552144 0.0258286832003 -0.112265012396
  efg_nonlocal H 4 -0.47263265592 -0.148232439756 0.491190116538 -0.148232439756 0.40383299567 0.0474885223735 0.491190116538 0.0474885223735 0.06879966025
  efg_nonlocal H 5 0.345536759085 0.227490107486 -0.192663085782 0.227490107486 -0.428940178047 0.468128657615 -0.192663085782 0.468128657615 0.083403418962
  efg_nonlocal H 6 0.682455309103 0.347422629338 -0.345110329811 0.347422629338 -0.57839260253 1.04274527009 -0.345110329811 1.04274527009 -0.104062706573
  efg_nonlocal C 1 0.130515539747 -0.00113106162527 -0.0103315568603 -0.00113106162527 -0.0778325541782 -0.186058494954 -0.0103315568603 -0.186058494954 -0.0526829855687
  efg_nonlocal C 2 -0.10120809182 -0.0606319177341 -0.25184927724 -0.0606319177341 0.10366108656 -0.201110715697 -0.25184927724 -0.201110715697 -0.00245299473989
  efg_nonlocal O 1 -0.0499340762424 -0.0597999337628 -0.341995493801 -0.0597999337628 0.070460923598 0.0611629807928 -0.341995493801 0.0611629807928 -0.0205268473556
  efg H 1 0.12793404309 0.0514298737569 0.20226839328 0.0514298737569 -0.133531745662 0.0414560149276 0.20226839328 0.0414560149276 0.00559770257191
  efg H 2 -0.133979130361 -0.0609040781878 0.0374120243967 -0.0609040781878 0.157638296763 -0.184442244602 0.0374120243967 -0.184442244602 -0.0236591664019
  efg H 3 0.12986839977 0.0652645621537 -0.201061065166 0.0652645621537 -0.128376570683 -0.0454082281587 -0.201061065166 -0.0454082281587 -0.00149182908676
  efg H 4 0.125522205339 0.060319384091 -0.183473060621 0.060319384091 -0.129847323513 -0.040585650492 -0.183473060621 -0.040585650492 0.00432511817317
  efg H 5 -0.126596501712 -0.0582754965986 0.0467662219879 -0.0582754965986 0.15405837804 -0.184288654121 0.0467662219879 -0.184288654121 -0.0274618763279
  efg H 6 -0.190199778929 -0.0789692888392 0.0920151083512 -0.0789692888392 0.199082123801 -0.306948344129 0.0920151083512 -0.306948344129 -0.00888234487242
  efg C 1 -0.0173552373 -0.0176045247437 -0.000136955319678 -0.0176045247437 0.0135099098682 0.0274798976768 -0.000136955319678 0.0274798976768 0.00384532743183
  efg C 2 0.184546017444 0.0651728710368 0.269047132476 0.0651728710368 -0.18101177765 0.104663940666 0.269047132476 0.104663940666 -0.0035342397939
  efg O 1 0.103201288239 0.138401445413 1.52917490275 0.138401445413 0.023733007643 -0.902715992177 1.52917490275 -0.902715992177 -0.126934295882
  isc_fc C 1 H 1 35.9946358421 1.08660078313 4.35110864214 1.08660078175 30.2365892665 0.812257453852 4.35110864168 0.812257453841 33.2357617836
  isc_fc C 1 H 2 31.1380312992 -1.21890555465 0.824294625004 -1.21890555432 37.2471446158 -4.19417641023 0.82429462563 -4.19417640926 33.6716733223
  isc_fc C 1 H 3 37.3134614796 1.5695753567 -4.23203198436 1.56957535695 31.7651945551 -1.13050653797 -4.23203198415 -1.13050653608 34.3953843096
  isc_fc C 1 H 4 1.171394881 -0.00245959281176 0.0888907042389 -0.00245959297273 1.4655854168 0.1064401538 0.0888907048839 0.106440153617 1.2444823826
  isc_fc C 1 H 5 0.480278947603 0.00779303492979 -0.0370551454302 0.00779303431011 0.372884818496 0.142437254584 -0.0370551459683 0.142437254725 0.589135204716
  isc_fc C 1 H 6 0.263119906174 0.00342470624062 -0.0207661093985 0.00342470637378 0.33742556529 0.0544173442504 -0.0207661083489 0.0544173453321 0.256170911424
  isc_fc C 1 C 1 -2802.07279605 -0.191050131725 -0.152689735333 -0.191050131709 -2801.10464395 0.728294531712 -0.152689742695 0.728294528496 -2801.44000714
  isc_fc C 1 C 2 31.8521200277 -1.73214565844 -1.45770280596 -1.73214565845 42.6480074009 9.04909872335 -1.45770280301 9.04909872098 39.1202320354
  isc_fc C 1 O 1 2.81101504079 -0.0406937892024 0.356042705931 -0.0406938003965 2.09289123888 -0.0442360147 0.356042706141 -0.0442360168606 1.6706317224
  isc_fc C 2 H 1 1.14414565227 -0.173500290471 -0.166894404479 -0.17350029037 1.20586181655 -0.0469014051319 -0.166894404049 -0.046901405484 0.99485526508
  isc_fc C 2 H 2 -0.488019233922 0.12451758949 -0.0119954139149 0.124517589368 -0.483092341025 0.170094957926 -0.0119954137686 0.170094958286 -0.39073770577
  isc_fc C 2 H 3 -0.765860440993 0.048712148947 0.12378979193 0.0487121484793 -0.509352319826 0.0759724695125 0.123789792317 0.0759724700755 -0.518874555715
  isc_fc C 2 H 4 40.0379264054 1.553077095 -4.84993950481 1.55307709563 34.8065771989 -1.3555725686 -4.84993950378 -1.35557256943 38.4908234851
  isc_fc C 2 H 5 34.9351080721 -1.05253139779 0.61218469604 -1.05253139791 42.2757584933 -4.60210322886 0.612184696098 -4.60210322888 37.660158525
  isc_fc C 2 H 6 0.216361013817 0.0878406280712 0.224067616248 0.087840628522 -0.180013124411 0.13394126665 0.224067616503 0.13394126723 0.0283503474047
  isc_fc C 2 C 1 33.0988763926 -4.00479724423 -2.88426386109 -4.0047972431 42.8683144345 8.13181995887 -2.88426386415 8.13181996122 37.6928670983
  isc_fc C 2 C 2 -2836.37598024 0.421303044923 1.97222480333 0.421303041951 -2838.74178312 1.08252819987 1.97222480915 1.08252819921 -2837.65686816
  isc_fc C 2 O 1 -43.4631275515 -2.04626259138 3.64667833856 -2.04626259518 -48.2972063886 -1.11218080624 3.6466783468 -1.11218080326 -44.1432517463
  isc_fc H 1 H 1 -80.4096038787 0.149883072227 0.611882525888 0.149883072227 -81.2026660922 0.118043734733 0.611882525762 0.118043734733 -80.8027508182
  isc_fc H 1 H 2 -0.418303238482 0.137900147953 0.183196353353 0.137900147953 -0.581477432275 0.0435438482087 0.183196353356 0.0435438482087 -0.578994457654
  isc_fc H 1 H 3 -0.397504641289 0.0455001721399 0.180618168528 0.0455001721399 -0.647001117992 0.0199822757169 0.180618168543 0.0199822757169 -0.302003339512
  isc_fc H 1 H 4 0.084047515237 0.0312449952927 0.0426071191305 0.0312449952927 0.100455890346 0.0165292920602 0.0426071191739 0.0165292920602 0.0532479494699
  isc_fc H 1 H 5 0.127091022129 0.00487819149814 0.0229593387828 0.00487819149814 0.0820570806384 0.0180925271879 0.0229593385842 0.0180925271879 0.184008397438
  isc_fc H 1 H 6 -0.0310705116171 0.00753702820518 0.0249028119296 0.00753702820518 -0.010987989109 0.0209945403493 0.0249028117287 0.0209945403493 -0.0328719933904
  isc_fc H 1 C 1 29.1554766966 -1.65738145349 -6.30546124516 -1.65738145349 37.3052973069 -1.25168052919 -6.30546124495 -1.25168052919 32.859953062
  isc_fc H 1 C 2 1.734529092 -0.263244735784 0.220776022455 -0.263244735784 0.827600940808 -0.183475111672 0.220776021931 -0.183475111672 0.80909698424
  isc_fc H 1 O 1 3.07272640793 -0.0223030691327 -0.0749119025458 -0.0223030691327 3.09892619176 -0.0734018542939 -0.0749119005415 -0.0734018542939 2.95859229252
  isc_fc H 2 H 1 -0.66231601841 0.0369393704404 0.0262127745375 0.0369393704404 -0.282206881192 -0.154133183044 0.0262127745375 -0.154133183044 -0.633477997403
  isc_fc H 2 H 2 -81.2821474664 -0.181179389648 0.0772948566004 -0.181179389648 -80.3446467464 -0.575462031071 0.0772948566004 -0.575462031071 -81.0551624919
  isc_fc H 2 H 3 -0.414025108949 -0.140866775063 0.024200882331 -0.140866775063 -0.221785073806 -0.16496052298 0.024200882331 -0.16496052298 -0.478012773656
  isc_fc H 2 H 4 0.302163789208 0.0186101115393 0.0150453044275 0.0186101115393 0.404493397488 -0.0131929554751 0.0150453044275 -0.0131929554751 0.317364050861
  isc_fc H 2 H 5 0.930066163717 -0.0413616645029 -0.00685575482673 -0.0413616645029 0.99067204749 0.0292961488218 -0.00685575482673 0.0292961488218 0.941925708619
  isc_fc H 2 H 6 0.016970527038 -0.0129209518533 -0.0183760302242 -0.0129209518533 0.059747319775 -0.0270217896573 -0.0183760302242 -0.0270217896573 -0.0268260441406
  isc_fc H 2 C 1 38.0862853063 1.90071650892 -1.15007103043 1.90071650892 28.8244414725 5.83840059784 -1.15007103043 5.83840059784 34.9955858012
  isc_fc H 2 C 2 -0.670723937155 -0.00221650319796 0.0926147674354 -0.00221650319796 -0.633539495181 -0.508048165916 0.0926147674354 -0.508048165916 0.0135831545625
  isc_fc H 2 O 1 1.05616826986 -0.206099718551 -0.0348444548437 -0.206099718551 0.898789961011 -0.45488862466 -0.0348444548437 -0.45488862466 0.946335714987
  isc_fc H 3 H 1 -0.40193882643 0.0402871017665 -0.18656544491 0.0402871017665 -0.646037042956 -0.0443650006067 -0.18656544515 -0.0443650006067 -0.298212167961
  isc_fc H 3 H 2 -0.16373361742 -0.0405618710004 -0.180793118191 -0.0405618710004 -0.519173323808 -0.0256220082013 -0.180793118322 -0.0256220082013 -0.434699008665
  isc_fc H 3 H 3 -80.5288242944 0.175173711737 -0.6374356724 0.175173711737 -81.3095199213 -0.128395955318 -0.637435672459 -0.128395955318 -80.9576612441
  isc_fc H 3 H 4 0.864078801821 -0.0221374743923 -0.0230557022304 -0.0221374743923 0.895025540207 0.0403874423288 -0.02305570302 0.0403874423288 0.902853260543
  isc_fc H 3 H 5 0.306654458517 0.0148856222385 -0.0319770898156 0.0148856222385 0.268852574072 0.00791242081942 -0.0319770899768 0.00791242081942 0.368147409739
  isc_fc H 3 H 6 -0.0101844838398 -0.00446173831157 -0.00147256764325 -0.00446173831157 0.0153173504558 0.0399350753936 -0.00147256797792 0.0399350753936 -0.0194218946657
  isc_fc H 3 C 1 30.2443046939 -1.94975227185 6.22415862697 -1.94975227185 38.5982130023 1.38720777447 6.22415862971 1.38720777447 34.4897800259
  isc_fc H 3 C 2 -0.19880296059 0.438712845314 -0.145508347848 0.438712845314 -0.598616089676 -0.277628938869 -0.145508341619 -0.277628938869 -0.928476165741
  isc_fc H 3 O 1 0.640396080472 0.0293632367605 -0.0384275434241 0.0293632367605 0.57276247316 -0.216368515132 -0.0384275434282 -0.216368515132 0.19332745443
  isc_fc H 4 H 1 0.115432349652 -0.0274254537727 -0.0399001718982 -0.0274254537727 0.0725729133224 0.000398902062753 -0.0399001718982 0.000398902062753 0.050124807085
  isc_fc H 4 H 2 0.332797505051 0.0174904166056 -0.0341981033723 0.0174904166056 0.29452193357 0.00483025039424 -0.0341981033723 0.00483025039424 0.398687483367
  isc_fc H 4 H 3 0.86729670008 -0.0132967375365 -0.0173383763877 -0.0132967375365 0.903523041131 0.0460532206996 -0.0173383763877 0.0460532206996 0.904834677813
  isc_fc H 4 H 4 -81.2555072153 0.153872706013 -0.685339904971 0.153872706013 -82.2234214031 -0.110395312078 -0.685339904971 -0.110395312078 -81.8406876385
  isc_fc H 4 H 5 -0.155732122776 -0.018513819961 -0.213318672748 -0.018513819961 -0.498581117291 -0.0178409583301 -0.213318672748 -0.0178409583301 -0.439716506638
  isc_fc H 4 H 6 0.20514243811 0.067185184809 -0.0368638493138 0.067185184809 0.166921582356 0.00286570721737 -0.0368638493138 0.00286570721737 0.138683638356
  isc_fc H 4 C 1 1.62578216221 0.438578952894 -0.125146861871 0.438578952894 1.34280743832 -0.323267549731 -0.125146861871 -0.323267549731 0.968845779205
  isc_fc H 4 C 2 33.0410120247 -1.87899129301 6.21870148053 -1.87899129301 41.9761075274 1.24863962808 6.21870148053 1.24863962808 38.1201992698
  isc_fc H 4 O 1 0.119032028193 -0.0830508639084 -0.393493268791 -0.0830508639084 1.38991636365 -0.182878787416 -0.393493268791 -0.182878787416 1.80634790014
  isc_fc H 5 H 1 0.128142765943 -0.0507095555574 -0.00553428862136 -0.0507095553876 0.159278930483 -0.0180262845993 -0.00553428862136 -0.0180262845993 0.105199182295
  isc_fc H 5 H 2 0.922517061298 -0.0320114896682 -0.00122112410506 -0.0320114896513 0.989422814896 0.0351675775728 -0.00122112410506 0.0351675775728 0.952402403412
  isc_fc H 5 H 3 0.275037883241 0.023834591733 0.0189243618617 0.0238345916392 0.378469409279 -0.0145227842872 0.0189243618617 -0.0145227842872 0.293002027715
  isc_fc H 5 H 4 -0.46097141559 -0.14587707387 0.0320782587402 -0.145877073745 -0.188930097101 -0.172511357963 0.0320782587402 -0.172511357963 -0.439288472805
  isc_fc H 5 H 5 -82.3014644003 -0.233909940763 0.107979032447 -0.233909940741 -81.1961488716 -0.651205691174 0.107979032447 -0.651205691174 -81.908381125
  isc_fc H 5 H 6 1.08746497419 -0.00599920974961 0.0799762892154 -0.00599920964567 0.986539831075 -0.00847239074046 0.0799762892154 -0.00847239074046 1.05422324058
  isc_fc H 5 C 1 0.293598232471 0.0147788785283 0.0323754527537 0.0147788783734 0.269817979099 -0.536990752891 0.0323754527537 -0.536990752891 0.929480081505
  isc_fc H 5 C 2 42.4373722641 2.12304059987 -1.32480992266 2.12304059931 33.1742224324 6.03669590303 -1.32480992266 6.03669590303 39.0606391252
  isc_fc H 5 O 1 7.25091182776 0.714418823708 -0.393174378331 0.714418822882 7.90610440741 0.348419487736 -0.393174378331 0.348419487736 6.76314735401
  isc_fc H 6 H 1 -0.0790749427707 -0.00597798771424 0.0428739306774 -0.00597798771424 -0.0322300916264 -0.0154691113856 0.042873930877 -0.0154691114349 0.0345512814988
  isc_fc H 6 H 2 0.0193420070102 -0.0208260884672 0.0077448820206 -0.0208260884672 -0.0196464320666 -0.035717245971 0.00774488187399 -0.0357172459378 0.0513732243497
  isc_fc H 6 H 3 0.00556853142401 0.00487575152267 0.0299484133238 0.00487575152267 -0.00569335888287 0.00933369589253 0.0299484133098 0.00933369587102 -0.0147006264813
  isc_fc H 6 H 4 0.101057704676 -0.035410595865 0.048252635576 -0.035410595865 0.198311589287 -0.0606924435449 0.0482526354333 -0.0606924435911 0.212636795714
  isc_fc H 6 H 5 1.08011375693 -0.00235238149958 0.0562519977436 -0.00235238149958 1.00023897145 0.00213383397724 0.0562519978341 0.00213383414886 1.06013686727
  isc_fc H 6 H 6 -76.1520399177 -0.386524722003 0.258698967656 -0.386524722003 -74.5283841675 -1.19290270829 0.258698967387 -1.19290270843 -75.2341934631
  isc_fc H 6 C 1 0.11572846219 -0.12954713589 -0.0977153248697 -0.12954713589 0.493091976094 -0.440879233209 -0.0977153258059 -0.440879233504 0.26140820131
  isc_fc H 6 C 2 -0.630581086648 0.407386434929 -0.516402096764 0.407386434929 1.19595054213 -0.412730905454 -0.516402098179 -0.412730904561 -0.496062743593
  isc_fc H 6 O 1 38.6730109349 4.30417073382 -2.66187005416 4.30417073382 23.135327443 12.2157309697 -2.66187005254 12.2157309689 30.2017435524
  isc_fc O 1 H 1 2.60189226952 0.59817536073 0.685702151379 0.59817536102 3.28654608842 1.02048157374 0.685702150624 1.02048157499 3.27276411934
  isc_fc O 1 H 2 0.912577362547 0.110676102515 0.104816901032 0.110676102273 1.03968300415 0.156325142106 0.104816901643 0.156325141282 0.961848810742
  isc_fc O 1 H 3 0.423069460078 0.108298990871 0.136873523868 0.108298991048 0.442508002046 0.110214389081 0.136873523683 0.110214391262 0.532153941646
  isc_fc O 1 H 4 2.27738466926 0.222750161295 -1.27088366541 0.222750161815 0.175201683296 -0.189916005893 -1.27088366475 -0.189916006338 0.916470854642
  isc_fc O 1 H 5 7.06711080714 0.107354767541 -0.169983143249 0.107354767061 7.58146214838 -0.0945679058677 -0.16998314345 -0.0945679056269 7.15461234737
  isc_fc O 1 H 6 18.8295958032 -3.84312327277 2.6181181416 -3.8431232729 43.9079775857 -17.1016133405 2.6181181405 -17.101613341 29.609512626
  isc_fc O 1 C 1 -2.11898036455 -3.95399920463 -3.54990244715 -3.9539992063 4.89444822118 7.93866826737 -3.54990244996 7.93866826656 3.75975465523
  isc_fc O 1 C 2 -29.8298821814 11.7198058238 21.5409281497 11.7198058291 -58.0892957502 7.6245261962 21.5409281498 7.62452619875 -48.0513704856
  isc_fc O 1 O 1 -11708.3401329 45.8905699273 2.10208369147 45.8905699241 -11659.5098869 -8.20553737349 2.10208369294 -8.20553738151 -11736.131338
  isc C 1 H 1 30.6826678444 -1.62975719737 -5.48015039636 -1.57659364137 37.4487199089 -1.18603354744 -5.44203254428 -1.20427495723 33.5914667613
  isc C 1 H 2 38.1939847986 1.80906837627 -1.00896264204 1.78698814802 30.123069688 4.83818876366 -1.0579723074 4.91530472337 35.9741194479
  isc C 1 H 3 31.5792071064 -1.45775468352 5.45503557239 -1.51896704435 38.9040980182 1.09338844913 5.41420686054 1.09742561781 35.1845328299
  isc C 1 H 4 1.49045503749 0.640802986263 0.0564090745134 0.558318551113 1.62034708178 -0.327857401277 0.0597938688448 -0.357106525719 0.737157643099
  isc C 1 H 5 0.351443385545 -0.00552353321262 0.0383607452002 0.0320753460182 -0.144325901487 -0.449501112964 -0.0151350052527 -0.384315238715 1.23290172147
  isc C 1 H 6 0.214783366703 -0.0918896762745 -0.105158018894 -0.0406903764847 0.596319610649 -0.376254013685 -0.196456305509 -0.541913474443 0.227998628905
  isc C 1 C 1 -2967.15897373 -0.0567797533567 -0.253895528567 -0.0427306188074 -2965.7944856 0.986726899261 -0.252603057537 0.983872712214 -2966.22024839
  isc C 1 C 2 27.7189556609 -6.4449869178 -4.00615165115 -6.40221256585 48.1439909835 18.3175598986 -3.89028772154 18.3051868033 39.1397675446
  isc C 1 O 1 -5.16909230347 -3.57645970541 -4.2479653284 -3.96726534402 4.19637912733 8.30275269583 -2.56474178964 8.41482324898 2.82924647793
  isc C 2 H 1 2.05022964856 -0.639291161367 0.0149130109705 -0.670861344044 0.980676265707 -0.387128999111 -0.0065763797666 -0.383782114346 0.579389710985
  isc C 2 H 2 -0.550515570171 0.0802627736288 0.14750286673 0.179102072927 -1.01393757159 -0.386069684761 0.0514614188944 -0.285598808935 0.315346623319
  isc C 2 H 3 -0.382575390568 0.685576895304 0.123193184207 0.540902590659 -0.317871613199 -0.231216545328 0.15669723815 -0.337552386225 -0.969953828999
  isc C 2 H 4 33.4723624677 -1.32821090621 4.86819073335 -1.32789670884 41.4605686848 0.658998183375 4.99706193394 0.698947247295 39.7469627326
  isc C 2 H 5 41.872535955 2.5731289266 -1.28067669934 2.68117630449 34.9743795357 4.863876123 -1.3343721286 4.78756109976 39.2686060364
  isc C 2 H 6 -0.277593622598 0.648066417286 -0.534666352821 1.05409011646 1.5298817447 -0.0365924505193 -0.747530893431 -0.28414228215 -0.523664701047
  isc C 2 C 1 27.8124299673 -6.41599539941 -3.89643169542 -6.44208619509 48.1687111086 18.3096732363 -4.00427666381 18.2807417781 39.1469587798
  isc C 2 C 2 -2997.42946986 0.0968084747702 -0.0624244779836 0.0995468206394 -2995.42057109 0.336167323973 -0.032748271037 0.33683813873 -2996.06812132
  isc C 2 O 1 -21.5247906043 9.4620584897 24.1059733484 7.61232662301 -52.1418846015 5.54882338421 25.1860141402 6.8218292721 -40.0701132738
  isc H 1 H 1 2.97410483503 -2.70165892166 1.50707455761 -2.7430539658 6.9658745472 0.810814767339 1.60306958778 0.890235069266 -8.5269946386
  isc H 1 H 2 -0.498615363307 0.217200750472 0.403409922666 0.199353115064 -0.267223309797 -0.204995898897 0.404649610705 -0.184766422109 -0.675840704294
  isc H 1 H 3 -0.169181559836 0.155921977877 0.0509658662849 0.163764458914 -0.983894731714 -0.0200731077399 0.00720217972707 -0.032035487293 -0.0182117600016
  isc H 1 H 4 0.10333898357 0.00892814613052 0.00789750719001 -0.00991323894355 0.0689546520892 0.0692766888876 -0.0147839319182 0.060922336088 0.0372243677199
  isc H 1 H 5 0.0865932063208 -0.0313316516112 0.036626367258 -0.0498089888109 0.143015314072 0.027756102664 0.0255542481556 0.042649692979 0.140067196824
  isc H 1 H 6 -0.150214659126 0.00838272030295 0.0712741572671 0.0261624912664 -0.0807151575722 0.0274744545661 0.067009549412 -0.00493427877876 0.0400920483225
  isc H 1 C 1 31.7476521007 -0.990381201009 -3.42485657825 -1.00259551278 36.0477688911 -0.7215773568 -3.49857740767 -0.737264050525 33.5988947272
  isc H 1 C 2 1.80168809985 -0.518775744223 -0.0684002089343 -0.426694149442 0.937576616273 -0.328875866807 0.00531669849026 -0.386121582716 0.668119181714
  isc H 1 O 1 1.97240909487 0.627202700452 0.511227750355 0.479858815939 3.07867201137 0.973264643821 0.518704043241 1.12188438016 3.03584902255
  isc H 2 H 1 -0.542290769968 0.17331151944 0.372596437436 0.216742531282 -0.196547127496 -0.218453678223 0.355496896228 -0.257119411836 -0.677144060763
  isc H 2 H 2 10.8778621973 -3.60475230244 -2.57372651163 -3.67610391942 7.56003441589 -4.55584847879 -2.53752171837 -4.45619007774 -13.9214687085
  isc H 2 H 3 -0.155101364178 -0.208127093545 -0.259326990441 -0.239661618357 -0.27922702007 -0.353003279136 -0.248023505657 -0.38679128024 -0.566124815685
  isc H 2 H 4 0.270326580539 0.00992288293244 -0.0440686803595 0.000251398962481 0.34815203204 0.0416997665363 -0.0383805023489 0.0241550036055 0.367632276639
  isc H 2 H 5 0.825720480992 -0.0585341016811 -0.0065594122703 -0.073337230798 1.02743097586 0.0717573848063 -0.000517064783312 0.0739820215663 0.88451565739
  isc H 2 H 6 -0.0540602673514 -0.0296157803272 -0.00726386117536 0.00999266268426 0.0240124414207 -0.0104958865771 -0.00519650500483 -0.0349399067687 -0.0267123386241
  isc H 2 C 1 36.7569262776 1.08389286047 -0.626202499709 1.17268917271 31.5601561136 3.11475736614 -0.609091003826 2.97627169031 35.5352005124
  isc H 2 C 2 -0.585680430616 0.198399605578 0.0128660309318 0.14550178373 -0.907858019491 -0.285523281542 0.0783800085424 -0.335664333495 0.0557699172386
  isc H 2 O 1 0.925680308985 -0.0618160579251 0.215811770404 -0.111886715129 1.0671316834 -0.275740363057 0.107698330175 -0.233259766783 0.697811993456
  isc H 3 H 1 -0.174486654215 0.174826215955 -0.0741710296022 0.16847313206 -0.973006462332 -0.0399365407525 -0.0205620248471 -0.0275370445833 -0.0251744585641
  isc H 3 H 2 -0.112466301606 -0.232181800953 -0.274240622793 -0.215854567289 -0.33419133672 -0.355361886804 -0.278651307319 -0.332095480566 -0.537952533761
  isc H 3 H 3 -11.6760610129 0.0389239648627 -4.63475457 0.0377952307334 8.60381419178 -0.464252825253 -4.82003469079 -0.473620432752 -7.90902347897
  isc H 3 H 4 0.834823196204 -0.038484239403 -0.0440036561035 -0.0324776649979 0.908556084483 0.103255708706 -0.0475426979489 0.106119345486 0.915213244073
  isc H 3 H 5 0.22641642479 0.00260962293405 -0.0265245430191 0.0181079061587 0.36760324601 0.0126931694775 -0.0284319079881 0.0313662159075 0.320300577274
  isc H 3 H 6 -0.100563297934 0.00589815496076 0.00988691434754 0.0191840775719 -0.0982375428087 0.101628901438 0.0362217271075 0.0402592635805 -0.0280282008519
  isc H 3 C 1 32.7186513826 -0.856204200421 3.38543177849 -0.767165636699 37.4690308196 0.591596523367 3.49068310529 0.622782767566 35.0946110477
  isc H 3 C 2 -0.424821311062 0.427643320159 0.180430780063 0.512823777012 -0.485609666544 -0.313690672451 0.127950509663 -0.273952051531 -0.923863128775
  isc H 3 O 1 -0.117691533359 0.066664328548 -0.0645599105307 -0.163390689379 0.274808540148 -0.280649206215 0.192094211638 -0.223456896036 0.240751671652
  isc H 4 H 1 0.106264252477 -0.00329971119232 -0.0191249787247 0.00678549995373 0.0817799520549 0.0590244924063 -0.00682414753215 0.0533450062552 0.04528431874
  isc H 4 H 2 0.279969715262 0.00234083525374 -0.0333489113071 0.00792536578491 0.376471477119 0.00429964297264 -0.0461896182454 0.0284737245065 0.350330478107
  isc H 4 H 3 0.838739565601 -0.0298502859437 -0.0472512750264 -0.0481634676757 0.920076777302 0.105957422252 -0.0486923697372 0.0928445743941 0.925801258544
  isc H 4 H 4 4.06040781209 -5.0256254251 -6.76437464831 -4.93420697404 7.604406207 -5.02812945735 -6.65605628281 -4.98646661419 -3.46743555013
  isc H 4 H 5 -0.172749190825 -0.211146609184 -0.279058263758 -0.178247455502 -0.311780841075 -0.33105552977 -0.318323285828 -0.338262940313 -0.554088438447
  isc H 4 H 6 0.180019337653 0.00754867698386 0.0611157715288 0.0642308243757 0.190250635206 -0.0383037405642 -0.000200151014689 -0.0837776487628 0.155975285186
  isc H 4 C 1 1.46703059168 0.398593102101 0.125866170133 0.399878742422 1.47626790187 -0.200621149363 0.0624973943779 -0.228422178524 0.839943837455
  isc H 4 C 2 34.8313806819 -0.615170286728 3.09624623454 -0.626424696804 39.9596538788 0.266388598222 2.90803201855 0.206584738846 39.2911684277
  isc H 4 O 1 1.3756918616 0.0953832727605 -1.90202701243 -0.0590283324024 0.750814082369 -0.955568315841 -1.56491189909 -0.519120730893 1.60822403405
  isc H 5 H 1 0.101750958421 -0.0457028114389 0.0167716714245 -0.0345635554182 0.134759310804 0.0371667504802 0.0237300616941 0.0265427112988 0.155033102305
  isc H 5 H 2 0.774483503752 -0.0575480329385 -0.00683176219737 -0.0478506231201 1.02823780851 0.0723612860281 -0.0145408212831 0.0818549376702 0.826258285868
  isc H 5 H 3 0.254179632739 0.0141617902454 -0.0196856331776 -0.00914104876672 0.341651366046 0.0259304982645 -0.0257433601749 0.00788129933172 0.33601231799
  isc H 5 H 4 -0.212438267573 -0.196279247917 -0.286421161011 -0.234449145778 -0.273830677095 -0.362686393762 -0.241180503396 -0.357953310222 -0.528120584505
  isc H 5 H 5 -7.97806815757 -4.49879685242 -5.2169180624 -4.3617836933 11.7533032524 -5.08193925503 -5.20045957363 -5.22444129025 5.36156356127
  isc H 5 H 6 1.17984880096 -0.0261536661101 0.175061993876 0.0212188554153 1.00554925543 -0.0111366663549 0.143064084541 -0.0369574417967 1.12107905699
  isc H 5 C 1 0.334363590358 0.0564929377599 0.0322579251143 0.0110423944319 0.00821544911402 -0.341553740772 0.0489789801213 -0.335245007716 0.948930180383
  isc H 5 C 2 40.40334991 1.7447934796 -0.737164952269 1.60622694843 36.2347013114 2.737968833 -0.670510516191 2.87622924725 38.9327436648
  isc H 5 O 1 7.05032760413 0.507769403213 -0.828210169009 0.782834524585 9.13176686547 0.135373787916 -0.912700759626 -0.215466033663 7.059156412
  isc H 6 H 1 -0.14312060858 0.00754088025044 0.047738514881 -8.28454026369e-05 -0.057168555792 0.00328657266518 0.052896359173 0.0171831924333 0.0234138715999
  isc H 6 H 2 -0.0269614765625 -0.00282460743916 0.00120461777299 -0.0338661468316 0.0421468681056 -0.0389409975216 -0.00271362673178 -0.0278373672552 -0.00428767630498
  isc H 6 H 3 -0.0853489481656 0.010497348151 0.0383212204882 0.000568036729305 -0.0583936875691 0.0404363232804 0.0132757205897 0.072250171327 -0.023601509733
  isc H 6 H 4 0.201311356646 0.0731058633305 -0.000950849712595 0.0327161567842 0.176467136988 -0.0835176876921 0.052756283177 -0.041629032184 0.151977611665
  isc H 6 H 5 1.16962978918 0.0260979473149 0.14615218636 -0.00527527324828 1.02298631666 -0.0320250689503 0.166208347926 -0.0108693233221 1.10582788762
  isc H 6 H 6 -18.7687713446 -3.67555273866 0.14451118412 -3.83817618203 6.24054408214 -2.60913691332 0.147429719909 -2.54657374015 13.8761638472
  isc H 6 C 1 0.153531855681 -0.0493901019368 -0.256331574004 -0.0725622458316 0.506949534512 -0.444292553303 -0.1368169793 -0.358030218284 0.143969816034
  isc H 6 C 2 -0.321656925841 0.749219957524 -0.645250780279 0.478175161648 1.25923203052 -0.228185709608 -0.517719173418 -0.0817056029894 -0.435551184552
  isc H 6 O 1 41.5298155885 3.87053767991 2.40197075905 4.67737612025 36.5746032841 3.74944514163 1.85634117553 3.13531309597 35.992778484
  isc O 1 H 1 2.3814248719 0.595053861624 0.716430978947 0.701021677467 3.24756470426 1.22690670403 0.762156767053 1.14304989914 3.11625214566
  isc O 1 H 2 1.11581247064 0.0256357687188 0.0348516607744 -0.0170075572746 1.09915524615 -0.189145710671 0.122751713086 -0.0785891076516 0.883989966241
  isc O 1 H 3 0.468501790422 -0.00213745228057 0.205446957902 0.111112452847 0.550356552054 -0.122894936675 -0.0622048938207 -0.0774607238982 0.22598974211
  isc O 1 H 4 1.1790644819 -0.118268986872 -1.79901520629 -0.0411371680149 1.00697559969 -0.665094827746 -1.85895459625 -0.931514215033 1.77889432978
  isc O 1 H 5 6.83529084996 1.16859534664 -1.31953936171 0.962403076145 9.59009452892 -0.120641069566 -1.28598179774 0.16897809553 6.76480531876
  isc O 1 H 6 43.2094556559 5.56276147619 1.51735336201 5.49897369013 36.4008010217 5.09293286667 1.68008117155 5.08264113455 36.1863087744
  isc O 1 C 1 -5.03359646533 -3.74418912421 -2.43422419175 -3.58830421782 4.11915008984 8.2735601603 -4.28015854016 8.28129073691 2.76448022907
  isc O 1 C 2 -21.6358972308 7.5812507502 25.2542332838 9.56566888858 -52.3552660487 6.88191840075 24.0727075218 5.53536215469 -40.2888897851
  isc O 1 O 1 -12954.4649666 59.5242259199 -49.3184606393 59.5174759308 -12913.1706944 22.3404222136 -49.6095076843 22.2358144557 -13018.8655741
[/magres]
`


export { exampleFiles }