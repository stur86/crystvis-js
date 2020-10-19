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


exports.exampleFiles = exampleFiles;