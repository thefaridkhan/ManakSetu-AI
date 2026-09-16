export interface StandardSeed {
  isNumber: string;
  standardNo: string;
  year: number;
  title: string;
  hindiTitle?: string;
  scope: string;
  icsCode: string;
  sector: string;
  isMandatoryQCO: boolean;
  qcoNotification?: string;
  schemeType: 'SCHEME_I_ISI_MARK' | 'SCHEME_II_CRS' | 'SCHEME_IV_FMCS' | 'HALLMARKING' | 'ECO_MARK';
  keyRequirements: string[];
  applicableProducts: string[];
  sampleSize?: string;
  testingDays?: number;
  amendmentsCount: number;
  sourceUrl?: string;
}

export interface ProductSeed {
  name: string;
  category: string;
  hsCode?: string;
  applicableStandard: string;
  isMandatory: boolean;
  scheme: 'SCHEME_I_ISI_MARK' | 'SCHEME_II_CRS' | 'SCHEME_IV_FMCS' | 'HALLMARKING' | 'ECO_MARK';
  description: string;
  estimatedFee?: string;
}

export interface SchemeSeed {
  schemeCode: 'SCHEME_I_ISI_MARK' | 'SCHEME_II_CRS' | 'SCHEME_IV_FMCS' | 'HALLMARKING' | 'ECO_MARK' | 'LABORATORY_RECOGNITION';
  title: string;
  hindiTitle: string;
  description: string;
  eligibleEntities: string;
  procedureSteps: { stepNo: number; title: string; description: string; timeEstimate: string }[];
  requiredDocuments: { docName: string; format: string; isMandatory: boolean }[];
  portalUrl: string;
  feeStructure: { applicationFee: string; inspectionFee: string; markingFee: string };
}

export interface GrievanceSeed {
  topic: string;
  category: string;
  description: string;
  stepsToReport: string[];
  bisCareAppAction: string;
  legalProvisions: string;
  contactHelpline: string;
  onlinePortalUrl: string;
}

export const BIS_SEED_STANDARDS: StandardSeed[] = [
  {
    isNumber: "IS 10500:2012",
    standardNo: "10500",
    year: 2012,
    title: "Drinking Water - Specification (Second Revision)",
    hindiTitle: "पेयजल - विशिष्टि (दूसरा पुनरीक्षण)",
    scope: "Prescribes the quality requirements, permissible limits for physical, chemical, toxic, and bacteriological characteristics of drinking water supplied to consumers.",
    icsCode: "13.060.20",
    sector: "Food and Agriculture / Water Supply",
    isMandatoryQCO: false,
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Total Dissolved Solids (TDS): Max 500 mg/l (Desirable), 2000 mg/l (Permissible)",
      "Turbidity: Max 1 NTU (Desirable), 5 NTU (Permissible)",
      "pH: 6.5 to 8.5",
      "Total Hardness (as CaCO3): Max 200 mg/l (Desirable), 600 mg/l (Permissible)",
      "E. Coli or thermotolerant coliform bacteria: Must be 0 in 100 ml sample",
      "Heavy metals: Lead max 0.01 mg/l, Arsenic max 0.01 mg/l, Mercury max 0.001 mg/l"
    ],
    applicableProducts: ["Municipal Tap Water", "Community Water Filtration Plants", "Borewell Drinking Supply"],
    sampleSize: "5 Litres in sterilized container",
    testingDays: 7,
    amendmentsCount: 3,
    sourceUrl: "https://www.services.bis.gov.in/php/BIS_2.0/bismanak/bis_search/standard_details/10500"
  },
  {
    isNumber: "IS 14543:2016",
    standardNo: "14543",
    year: 2016,
    title: "Packaged Drinking Water (Other Than Packaged Natural Mineral Water) - Specification",
    hindiTitle: "पैकेज्ड पेयजल (प्राकृतिक खनिज जल से भिन्न) - विशिष्टि",
    scope: "Specifies microbiological, chemical, organoleptic, and packaging requirements for sealed packaged drinking water bottles and jars.",
    icsCode: "13.060.20",
    sector: "Food and Agriculture / Beverages",
    isMandatoryQCO: true,
    qcoNotification: "FSSAI / Gazette Notification S.O. 1362(E)",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Mandatory ISI Certification mark before sale under Food Safety Act & BIS Act",
      "Microbiological purity: Absence of Coliforms, Faecal Streptococci, Pseudomonas aeruginosa, Yeast & Mould",
      "Disinfection by Ozonation or UV irradiation",
      "Packaging in food grade PET/polycarbonate conforming to IS 15410",
      "Labeling with CM/L License number and Standard Mark"
    ],
    applicableProducts: ["Packaged Drinking Water (Bottles 250ml - 20L Jars)", "Water Pouches"],
    sampleSize: "12 Packaged units (minimum 1000ml each)",
    testingDays: 14,
    amendmentsCount: 4,
    sourceUrl: "https://www.services.bis.gov.in/php/BIS_2.0/bismanak/bis_search/standard_details/14543"
  },
  {
    isNumber: "IS 13428:2005",
    standardNo: "13428",
    year: 2005,
    title: "Packaged Natural Mineral Water - Specification",
    hindiTitle: "पैकेज्ड प्राकृतिक खनिज जल - विशिष्टि",
    scope: "Prescribes requirements for water obtained directly from natural subterranean sources such as springs, characterized by mineral content and origin.",
    icsCode: "13.060.20",
    sector: "Food and Agriculture",
    isMandatoryQCO: true,
    qcoNotification: "Mandatory Certification under Prevention of Food Adulteration / FSSAI",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Source protection: Must be sourced from underground aquifers/springs without chemical treatments",
      "Natural mineralization must remain intact",
      "Packaging at source strictly mandatory",
      "Absence of pathogenic organisms and heavy metals"
    ],
    applicableProducts: ["Himalayan Natural Spring Water", "Artisan Mineral Water"],
    sampleSize: "12 Bottles",
    testingDays: 14,
    amendmentsCount: 3,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 1786:2008",
    standardNo: "1786",
    year: 2008,
    title: "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement (TMT Rebars)",
    hindiTitle: "कंक्रीट प्रबलन के लिए उच्च सामर्थ्य विरूपित इस्पात छड़ें और तार (टीएमटी सरिया)",
    scope: "Covers requirements for thermo-mechanically treated (TMT) and cold twisted deformed steel bars of grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D, Fe 600.",
    icsCode: "77.140.15",
    sector: "Metallurgical Engineering / Steel",
    isMandatoryQCO: true,
    qcoNotification: "Steel and Steel Products (Quality Control) Order, 2020",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Proof stress / Yield strength: Min 415 to 600 N/mm2 depending on grade",
      "Tensile Strength to Yield Ratio: Min 1.10 for D grades (High Ductility for Earthquake Resistance)",
      "Elongation: Min 14.5% to 18%",
      "Bend and Rebend tests without cracking",
      "Chemical Limits: Carbon Max 0.25%, Sulphur + Phosphorus Max 0.075%"
    ],
    applicableProducts: ["TMT Rebars 8mm to 32mm", "Earthquake Resistant Construction Steel", "Prestressing Wires"],
    sampleSize: "3 Test pieces of 1 meter length each",
    testingDays: 5,
    amendmentsCount: 3,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 269:2015",
    standardNo: "269",
    year: 2015,
    title: "Ordinary Portland Cement (OPC 33, 43 and 53 Grade) - Specification",
    hindiTitle: "साधारण पोर्टलैंड सीमेंट (33, 43 और 53 ग्रेड) - विशिष्टि",
    scope: "Covers manufacture, chemical composition, physical properties and packaging of OPC grades used in reinforced concrete structures, bridges, and infrastructure.",
    icsCode: "91.100.10",
    sector: "Civil Engineering / Building Materials",
    isMandatoryQCO: true,
    qcoNotification: "Cement (Quality Control) Order, 2003",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Compressive Strength (28 days): Min 33 MPa (OPC 33), Min 43 MPa (OPC 43), Min 53 MPa (OPC 53)",
      "Initial Setting Time: Min 30 minutes; Final Setting Time: Max 600 minutes",
      "Fineness (Blaine air permeability): Min 225 m2/kg",
      "Soundness (Le Chatelier): Max 10 mm",
      "Insoluble Residue: Max 5.0%"
    ],
    applicableProducts: ["OPC 43 Grade Cement", "OPC 53 Grade Structural Cement", "High Early Strength Concrete"],
    sampleSize: "10 kg sample collected in moisture-proof container",
    testingDays: 32,
    amendmentsCount: 2,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 1489 (Part 1):2015",
    standardNo: "1489",
    year: 2015,
    title: "Portland Pozzolana Cement - Specification - Part 1: Fly Ash Based (PPC)",
    hindiTitle: "पोर्टलैंड पोजोलाना सीमेंट - विशिष्टि - भाग 1: फ्लाई ऐश आधारित",
    scope: "Specifies requirements for PPC produced by intergrinding Portland cement clinker, gypsum, and pozzolanic materials (fly ash).",
    icsCode: "91.100.10",
    sector: "Civil Engineering / Building Materials",
    isMandatoryQCO: true,
    qcoNotification: "Cement (Quality Control) Order, 2003",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Fly ash constituent: 15% to 35% by mass",
      "Compressive Strength at 28 days: Min 33 MPa",
      "Initial Setting Time: Min 30 mins, Final: Max 600 mins",
      "Drying shrinkage: Max 0.15%"
    ],
    applicableProducts: ["PPC Cement for Plastering and General Masonry", "Marine Concrete Construction"],
    sampleSize: "10 kg",
    testingDays: 32,
    amendmentsCount: 2,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 1554 (Part 1):1988",
    standardNo: "1554",
    year: 1988,
    title: "PVC Insulated (Heavy Duty) Electric Cables - Part 1: For Working Voltages Up to and Including 1100 V",
    hindiTitle: "पीवीसी विद्युत केबल - भाग 1: 1100 वोल्ट तक के कार्यशील वोल्टेज के लिए",
    scope: "Specifies construction, insulation, sheath thickness, conductor resistance, and fire resistance for low voltage power distribution cables.",
    icsCode: "29.060.20",
    sector: "Electrotechnical / Power Cables",
    isMandatoryQCO: true,
    qcoNotification: "Electrical Wires and Cables (Quality Control) Order, 2023",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Conductor: Plain or tinned annealed copper / aluminum conforming to IS 8130",
      "Insulation resistance and spark test compliance",
      "Flammability test according to IEC / IS standard",
      "Armouring and inner sheath thickness tolerances"
    ],
    applicableProducts: ["Underground Armoured Power Cables", "Industrial Distribution Cables"],
    sampleSize: "50 meter coil",
    testingDays: 10,
    amendmentsCount: 5,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 694:2010",
    standardNo: "694",
    year: 2010,
    title: "Polyvinyl Chloride (PVC) Insulated Unsheathed and Sheathed Cables/Cords with Rigid and Flexible Conductors",
    hindiTitle: "पीवीसी इंसुलेटेड लचीले तार और केबल",
    scope: "Covers requirements for domestic house wiring wires, flexible appliance power cords for operating voltages up to 1100V.",
    icsCode: "29.060.20",
    sector: "Electrotechnical / Domestic Cables",
    isMandatoryQCO: true,
    qcoNotification: "Wires and Cable Quality Control Order, 2023",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Flame Retardant (FR) & Low Smoke Halogen Free (FRLS) characteristics",
      "Oxygen Index: Min 29%",
      "Conductor resistance within permissible limits of IS 8130",
      "High voltage immersion test at 2 kV for 15 mins"
    ],
    applicableProducts: ["House Wiring Cable (1.0 to 6.0 sq mm)", "Flexible Submersible Pump Wire", "Appliance Cords"],
    sampleSize: "30 meter coil",
    testingDays: 7,
    amendmentsCount: 3,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 1293:2019",
    standardNo: "1293",
    year: 2019,
    title: "Plugs and Socket-Outlets for Household and Similar Purposes - Specification",
    hindiTitle: "घरेलू और समान प्रयोजनों के लिए प्लग और सॉकेट-आउटलेट",
    scope: "Prescribes dimensions, safety shutter requirements, temperature rise, mechanical strength, and electric shock protection for 6A, 16A, and 25A 250V AC plugs and sockets.",
    icsCode: "29.120.30",
    sector: "Electrotechnical / Wiring Accessories",
    isMandatoryQCO: true,
    qcoNotification: "Plugs and Socket-Outlets (Quality Control) Order, 2020",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Mandatory safety shutters on socket-outlets to prevent child electric shock hazard",
      "Dimensions must conform strictly to standard gauge drawing sheets (Sheet 1 to Sheet 4)",
      "Temperature rise test: Terminal temperature rise shall not exceed 45°C under continuous rated current",
      "Resistance to tracking (Glow wire test at 850°C for insulating parts)"
    ],
    applicableProducts: ["3-Pin 6A & 16A Plugs", "Modular Sockets", "Multi-plug Adaptors", "Power Extension Boards"],
    sampleSize: "15 pieces of plugs/sockets",
    testingDays: 14,
    amendmentsCount: 2,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 9873 (Part 1):2019",
    standardNo: "9873",
    year: 2019,
    title: "Safety of Toys - Part 1: Mechanical and Physical Properties",
    hindiTitle: "खिलौनों की सुरक्षा - भाग 1: यांत्रिक और भौतिक गुण",
    scope: "Specifies requirements and test methods for toys intended for use by children under 14 years, addressing choking hazards, sharp edges, small parts, and projectile toys.",
    icsCode: "97.200.50",
    sector: "Mechanical Engineering / Toys",
    isMandatoryQCO: true,
    qcoNotification: "Toys (Quality Control) Order, 2020 (DPIIT)",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Mandatory ISI Mark certification for all imported and domestically manufactured toys",
      "Small parts cylinder test: No component may fit into small parts cylinder for toys intended for children under 3 years",
      "Drop test, impact test, torque test, and tension test without producing sharp edges",
      "Heavy metal limits (Lead < 90 mg/kg, Cadmium < 75 mg/kg, Phthalates testing under Part 3 & 6)"
    ],
    applicableProducts: ["Plastic Toys", "Electronic Remote Toys", "Plush Stuffed Animals", "Ride-on Toys", "Baby Rattles"],
    sampleSize: "10 pieces of identical retail packaged toy",
    testingDays: 10,
    amendmentsCount: 2,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 4151:2015",
    standardNo: "4151",
    year: 2015,
    title: "Protective Helmets for Two-Wheeler Riders - Specification",
    hindiTitle: "दोपहिया वाहन चालकों के लिए सुरक्षात्मक हेलमेट",
    scope: "Prescribes construction, shock absorption capacity, retention system strength, peripheral vision angle, and visor optical properties for two-wheeler motorcycle helmets.",
    icsCode: "13.340.20",
    sector: "Mechanical / Personal Protective Equipment",
    isMandatoryQCO: true,
    qcoNotification: "Helmet Quality Control Order, 2020 (MoRTH)",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Weight limit: Maximum permissible helmet weight is 1.2 kg",
      "Impact absorption test with flat and hemispherical anvils under ambient, heat, cold, and water immersion conditions",
      "Retention system dynamic test: Chin strap elongation not exceeding 25mm",
      "Visor optical quality: Min 85% light transmission for clear visors"
    ],
    applicableProducts: ["Full-face Helmets", "Open-face Helmets", "Modular Helmets"],
    sampleSize: "12 Helmets",
    testingDays: 8,
    amendmentsCount: 2,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 1417:2016",
    standardNo: "1417",
    year: 2016,
    title: "Gold and Gold Alloys, Jewellery/Artefacts - Fineness and Marking",
    hindiTitle: "सोना और सोने की मिश्रधातुएं, आभूषण - शुद्धता और अंकन",
    scope: "Specifies the designated fineness degrees (999, 958, 916 - 22K, 875, 750 - 18K, 585 - 14K, 375 - 9K) and hallmarking conventions for gold jewellery sold in India.",
    icsCode: "39.060",
    sector: "Hallmarking / Precious Metals",
    isMandatoryQCO: true,
    qcoNotification: "Mandatory Gold Hallmarking Order (Department of Consumer Affairs)",
    schemeType: "HALLMARKING",
    keyRequirements: [
      "Mandatory 3 Hallmarking Symbols: 1) BIS Logo, 2) Purity in Karat & Fineness (e.g. 22K916), 3) 6-digit alphanumeric HUID (Hallmark Unique Identification)",
      "Assaying method: Fire Assay method conforming to IS 15820",
      "Traceability: HUID code verifiable by consumer on the official BIS Care Mobile App",
      "Zero tolerance for under-karatage"
    ],
    applicableProducts: ["Gold Bangles", "Gold Necklaces", "Gold Coins", "Bridal Jewellery", "Gold Chains"],
    sampleSize: "Sample scraped/cut per assay batch in recognized AHC",
    testingDays: 1,
    amendmentsCount: 4,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 2112:2014",
    standardNo: "2112",
    year: 2014,
    title: "Silver and Silver Alloys, Jewellery/Artefacts - Fineness and Marking",
    hindiTitle: "चांदी और चांदी के आभूषण - शुद्धता और अंकन",
    scope: "Prescribes silver purity grades (999, 970, 925 Sterling Silver, 900, 835, 800) and hallmarking marks for silver articles.",
    icsCode: "39.060",
    sector: "Hallmarking / Precious Metals",
    isMandatoryQCO: false,
    schemeType: "HALLMARKING",
    keyRequirements: [
      "Voluntary Hallmarking with BIS Triangular mark, purity (e.g. 925), and Jeweller Identification Mark",
      "Assay testing via Volumetric (Potentiometric) method"
    ],
    applicableProducts: ["Sterling Silver Cutlery", "Silver Idols", "Silver Anklets (Payal)", "Silver Coins"],
    sampleSize: "Representative sample from lot",
    testingDays: 2,
    amendmentsCount: 1,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 16046 (Part 1):2018 / IEC 62133-1",
    standardNo: "16046-1",
    year: 2018,
    title: "Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes (Nickel Systems)",
    hindiTitle: "निकल प्रणाली रिचार्जेबल बैटरी सुरक्षा",
    scope: "Specifies requirements and tests for portable sealed secondary nickel cells and batteries used in electronic gadgets.",
    icsCode: "29.220.30",
    sector: "Electronics / IT Goods",
    isMandatoryQCO: true,
    qcoNotification: "MeitY Compulsory Registration Scheme (CRS)",
    schemeType: "SCHEME_II_CRS",
    keyRequirements: [
      "Mandatory Compulsory Registration Scheme (CRS) with BIS portal",
      "Overcharge safety test, short-circuit test, forced discharge test",
      "Thermal abuse test at 130°C without explosion or fire",
      "Drop and vibration resistance"
    ],
    applicableProducts: ["Rechargeable Battery Packs", "Power Tools", "Emergency Lighting Units"],
    sampleSize: "25 cells + 15 battery packs",
    testingDays: 15,
    amendmentsCount: 2,
    sourceUrl: "https://www.crsbis.in"
  },
  {
    isNumber: "IS 16046 (Part 2):2018 / IEC 62133-2",
    standardNo: "16046-2",
    year: 2018,
    title: "Secondary Lithium Cells and Batteries for Portable Applications - Safety Requirements",
    hindiTitle: "पोर्टेबल अनुप्रयोगों के लिए लिथियम सेल और बैटरी - सुरक्षा",
    scope: "Safety standards for Lithium-ion and Lithium-polymer rechargeable cells and battery packs used in smartphones, laptops, wearables, and electric bicycles.",
    icsCode: "29.220.30",
    sector: "Electronics / Compulsory Registration Scheme (CRS)",
    isMandatoryQCO: true,
    qcoNotification: "Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order",
    schemeType: "SCHEME_II_CRS",
    keyRequirements: [
      "Self-declaration of conformity with CRS registration number (R-XXXXXXXX) and BIS standard mark",
      "Crush test, mechanical shock, thermal cycling from -20°C to +75°C",
      "Continuous charging safety without swelling, leakage, or ignition",
      "Battery management system (BMS) circuit verification"
    ],
    applicableProducts: ["Smartphone Lithium Batteries", "Laptop Power Banks", "EV 2-Wheeler Battery Packs", "Smartwatch Batteries"],
    sampleSize: "30 Cells and 20 Battery Packs",
    testingDays: 20,
    amendmentsCount: 2,
    sourceUrl: "https://www.crsbis.in"
  },
  {
    isNumber: "IS 13252 (Part 1):2010 / IEC 60950-1",
    standardNo: "13252",
    year: 2010,
    title: "Information Technology Equipment - Safety - Part 1: General Requirements",
    hindiTitle: "सूचना प्रौद्योगिकी उपकरण - सुरक्षा",
    scope: "Covers electrical safety, fire hazard prevention, user touch voltage limits, and radiation safety for IT equipment, computers, adapters, and servers.",
    icsCode: "35.020",
    sector: "Electronics / CRS",
    isMandatoryQCO: true,
    qcoNotification: "MeitY CRS Order, 2012",
    schemeType: "SCHEME_II_CRS",
    keyRequirements: [
      "Insulation resistance and electric strength test (Dielectric test 3000V)",
      "Touch temperature limits for accessible enclosures and plastic housings",
      "Power adapter efficiency and energy dissipation safety",
      "Fire-resistant enclosure rating (V-0 or V-1 flame rating)"
    ],
    applicableProducts: ["Laptops", "Tablets", "AC Power Adapters", "Computer Monitors", "Printers", "Servers", "Scanners"],
    sampleSize: "3 complete retail samples with power adapters",
    testingDays: 14,
    amendmentsCount: 3,
    sourceUrl: "https://www.crsbis.in"
  },
  {
    isNumber: "IS 16102 (Part 1):2012",
    standardNo: "16102-1",
    year: 2012,
    title: "Self-Ballasted LED Lamps for General Lighting Services - Part 1: Safety Requirements",
    hindiTitle: "सामान्य प्रकाश व्यवस्था के लिए सेल्फ-बैलास्टेड एलईडी लैंप - सुरक्षा",
    scope: "Specifies safety and interchangeability requirements for LED bulbs with integrated means for controlling supply current for domestic lighting.",
    icsCode: "29.140.01",
    sector: "Electrotechnical / Lighting",
    isMandatoryQCO: true,
    qcoNotification: "LED Lamps Quality Control Order / CRS",
    schemeType: "SCHEME_II_CRS",
    keyRequirements: [
      "Cap temperature rise test: Max 120°C",
      "Creepage distance and electrical clearances",
      "Torsion resistance of bulb cap (B22d / E27 caps)",
      "High voltage insulation breakdown resistance"
    ],
    applicableProducts: ["LED Bulbs (3W to 20W)", "B22/E27 Household LED Lamps"],
    sampleSize: "20 Lamps",
    testingDays: 10,
    amendmentsCount: 2,
    sourceUrl: "https://www.crsbis.in"
  },
  {
    isNumber: "IS 4984:2016",
    standardNo: "4984",
    year: 2016,
    title: "High Density Polyethylene Pipes (HDPE) for Water Supply - Specification",
    hindiTitle: "जल आपूर्ति के लिए उच्च घनत्व पॉलीथीन पाइप (एचडीपीई) - विशिष्टि",
    scope: "Specifies requirements for HDPE pipes of PE 63, PE 80, and PE 100 grades for municipal water supply, agricultural irrigation, and industrial conveyance.",
    icsCode: "23.040.20",
    sector: "Civil / Plastics",
    isMandatoryQCO: true,
    qcoNotification: "Pipes and Fittings (Quality Control) Order, 2023",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Hydrostatic internal pressure creep test at 80°C for 165 hours and 1000 hours",
      "Melt Flow Rate (MFR) compatibility and Carbon Black content 2.0% - 2.5%",
      "Elongation at break: Min 350%",
      "Overall migration limit for food contact water safety"
    ],
    applicableProducts: ["HDPE Water Distribution Pipes (20mm to 1000mm OD)", "Drip Irrigation Mainlines"],
    sampleSize: "3 pipe specimens of 2 meter length",
    testingDays: 45,
    amendmentsCount: 2,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 302 (Part 2/Sec 3):2007",
    standardNo: "302-2-3",
    year: 2007,
    title: "Safety of Household and Similar Electrical Appliances - Particular Requirements for Electric Irons",
    hindiTitle: "घरेलू विद्युत उपकरणों की सुरक्षा - इलेक्ट्रिक आयरन",
    scope: "Deals with the safety of electric dry irons and steam irons for domestic use, ensuring safety against thermal, mechanical, and electric hazards.",
    icsCode: "97.060",
    sector: "Electrotechnical / Domestic Appliances",
    isMandatoryQCO: true,
    qcoNotification: "Electrical Appliances Quality Control Order",
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Thermal cutout protection preventing overheating and fire",
      "Earthing continuity and leakage current max 0.75 mA",
      "Mechanical stability on 10° inclined plane without tipping",
      "Drop test of iron onto metal plate from 40mm height"
    ],
    applicableProducts: ["Dry Electric Irons", "Steam Irons", "Cordless Garment Steamers"],
    sampleSize: "3 Units",
    testingDays: 7,
    amendmentsCount: 2,
    sourceUrl: "https://www.services.bis.gov.in"
  },
  {
    isNumber: "IS 456:2000",
    standardNo: "456",
    year: 2000,
    title: "Plain and Reinforced Concrete - Code of Practice (Fourth Revision)",
    hindiTitle: "सादा और प्रबलित कंक्रीट - अभ्यास संहिता",
    scope: "The fundamental structural design code of India for all concrete construction, detailing material specifications, limit state design, workability, and durability.",
    icsCode: "91.100.30",
    sector: "Civil Engineering / Structural Design",
    isMandatoryQCO: false,
    schemeType: "SCHEME_I_ISI_MARK",
    keyRequirements: [
      "Concrete grades M10 to M80 designation",
      "Minimum cement content and maximum water-cement ratio for environmental exposure (Mild, Moderate, Severe, Very Severe, Extreme)",
      "Minimum cover to reinforcement for corrosion protection",
      "Limit state design for flexure, shear, torsion, and deflection criteria"
    ],
    applicableProducts: ["Ready Mixed Concrete (RMC)", "Structural Beams and Columns", "Bridge Decks"],
    sampleSize: "Concrete cubes 150mm x 150mm x 150mm",
    testingDays: 28,
    amendmentsCount: 5,
    sourceUrl: "https://www.services.bis.gov.in"
  }
];

export const BIS_SEED_PRODUCTS: ProductSeed[] = [
  {
    name: "Packaged Drinking Water (Bottles & Jars)",
    category: "Food & Beverages",
    hsCode: "22019090",
    applicableStandard: "IS 14543",
    isMandatory: true,
    scheme: "SCHEME_I_ISI_MARK",
    description: "Packaged drinking water treated by RO, ozonation, UV for human consumption in sealed containers.",
    estimatedFee: "₹1,000 Application + ₹7,000 Inspection + ₹1,60,000 Marking Fee/yr"
  },
  {
    name: "TMT Steel Reinforcement Rebars",
    category: "Steel & Metallurgy",
    hsCode: "72142090",
    applicableStandard: "IS 1786",
    isMandatory: true,
    scheme: "SCHEME_I_ISI_MARK",
    description: "High strength thermo-mechanically treated steel rebar grades Fe 500D / Fe 550D for building and infrastructure construction.",
    estimatedFee: "₹1,000 Application + ₹7,000 Inspection + Unit Rate Marking Fee"
  },
  {
    name: "Ordinary Portland Cement (OPC 43/53)",
    category: "Building Materials",
    hsCode: "252329",
    applicableStandard: "IS 269",
    isMandatory: true,
    scheme: "SCHEME_I_ISI_MARK",
    description: "Structural hydraulic cement for bridges, high-rise buildings, and precast concrete.",
    estimatedFee: "₹1,000 Application + ₹7,000 Inspection + ₹2.50 per tonne Marking Fee"
  },
  {
    name: "Electric Plugs & Sockets (6A, 16A)",
    category: "Electrical Accessories",
    hsCode: "853669",
    applicableStandard: "IS 1293",
    isMandatory: true,
    scheme: "SCHEME_I_ISI_MARK",
    description: "Household safety-shuttered wall sockets and 3-pin plugs for domestic appliances.",
    estimatedFee: "₹1,000 Application + ₹7,000 Inspection + ₹45,000 Marking Fee"
  },
  {
    name: "Children Plastic & Electronic Toys",
    category: "Consumer Goods",
    hsCode: "950300",
    applicableStandard: "IS 9873 (Part 1)",
    isMandatory: true,
    scheme: "SCHEME_I_ISI_MARK",
    description: "Safety of toys addressing choking hazards, sharp edges, heavy metals, and physical safety for children under 14.",
    estimatedFee: "₹1,000 Application + ₹7,000 Inspection + ₹30,000 Marking Fee"
  },
  {
    name: "Two-Wheeler Motorcycle Helmets",
    category: "Personal Safety Equipment",
    hsCode: "650610",
    applicableStandard: "IS 4151",
    isMandatory: true,
    scheme: "SCHEME_I_ISI_MARK",
    description: "Shock-absorbing protective helmets for motorbike riders conforming to 1.2kg max weight limit.",
    estimatedFee: "₹1,000 Application + ₹7,000 Inspection + ₹50,000 Marking Fee"
  },
  {
    name: "Lithium-ion Power Banks & Mobile Batteries",
    category: "Electronics / IT Goods",
    hsCode: "850760",
    applicableStandard: "IS 16046 (Part 2)",
    isMandatory: true,
    scheme: "SCHEME_II_CRS",
    description: "Compulsory Registration Scheme for secondary lithium batteries used in smartphones and laptops.",
    estimatedFee: "₹15,000 Registration Fee + Test report from NABL/BIS recognized lab"
  },
  {
    name: "Gold Jewellery (22K, 18K, 14K)",
    category: "Precious Metals",
    hsCode: "711319",
    applicableStandard: "IS 1417",
    isMandatory: true,
    scheme: "HALLMARKING",
    description: "Mandatory gold jewellery hallmarking with 6-digit HUID code verifiable on BIS Care app.",
    estimatedFee: "₹35 per article hallmarking fee at authorized AHC"
  }
];

export const BIS_SEED_SCHEMES: SchemeSeed[] = [
  {
    schemeCode: "SCHEME_I_ISI_MARK",
    title: "Product Certification Scheme (ISI Mark)",
    hindiTitle: "उत्पाद प्रमाणन योजना (आई.एस.आई. मार्क)",
    description: "Scheme I is the flagship conformity assessment scheme of BIS operating under the BIS Act 2016. It grants licenses (CM/L) to manufacturers with testing and quality control facilities conforming to Indian Standards.",
    eligibleEntities: "Domestic and foreign manufacturers with in-house testing laboratories and manufacturing setup.",
    procedureSteps: [
      { stepNo: 1, title: "Online Application Submission", description: "Submit application on Manakonline portal with Form I, factory layout, machinery list, and test equipment.", timeEstimate: "1 - 2 Days" },
      { stepNo: 2, title: "Factory Audit & Inspection", description: "BIS inspecting officer visits the factory, assesses quality control systems, and draws test samples.", timeEstimate: "15 - 30 Days" },
      { stepNo: 3, title: "Sample Testing in BIS Lab", description: "Independent testing of collected samples in BIS Central / Regional Laboratories or NABL accredited labs.", timeEstimate: "15 - 45 Days" },
      { stepNo: 4, title: "Grant of License (CM/L)", description: "Upon successful test results and scrutiny, BIS issues the Certificate of Manufacture License and allows use of the ISI Mark.", timeEstimate: "7 - 10 Days" }
    ],
    requiredDocuments: [
      { docName: "Proof of Factory Address (Electricity bill / Lease deed / GST)", format: "PDF", isMandatory: true },
      { docName: "Manufacturing Process Flowchart & Machinery Details", format: "PDF", isMandatory: true },
      { docName: "List of In-house Quality Testing Equipment & Valid Calibration Certificates", format: "PDF", isMandatory: true },
      { docName: "Appointment Letter & Qualification of Quality Control Personnel", format: "PDF", isMandatory: true },
      { docName: "Scheme of Inspection and Testing (SIT) acceptance declaration", format: "PDF", isMandatory: true }
    ],
    portalUrl: "https://www.manakonline.in",
    feeStructure: {
      applicationFee: "₹1,000 (One time)",
      inspectionFee: "₹7,000 per man-day of audit",
      markingFee: "As per specific product schedule (e.g. ₹1,60,000/yr for Water, ₹45,000 for Electrical)"
    }
  },
  {
    schemeCode: "SCHEME_II_CRS",
    title: "Compulsory Registration Scheme (CRS) for IT & Electronics",
    hindiTitle: "अनिवार्य पंजीकरण योजना (सी.आर.एस.)",
    description: "Simplified conformity assessment based on self-declaration of conformity. Products must be tested in BIS-recognized laboratories in India before registration on the CRS portal.",
    eligibleEntities: "Domestic and international manufacturers of electronic and IT hardware notified by MeitY and MNRE.",
    procedureSteps: [
      { stepNo: 1, title: "Lab Sample Testing", description: "Submit product samples to a BIS-recognized testing laboratory in India for safety test report generation.", timeEstimate: "15 - 20 Days" },
      { stepNo: 2, title: "Online CRS Portal Submission", description: "Register on crsbis.in with valid test report, Affidavit cum Undertaking, and Brand Authorization.", timeEstimate: "2 - 3 Days" },
      { stepNo: 3, title: "Document Scrutiny by BIS", description: "BIS officer verifies the test report and compliance details.", timeEstimate: "10 - 15 Days" },
      { stepNo: 4, title: "Grant of Registration (R-Number)", description: "BIS issues 8-digit unique Registration Number (e.g. R-85001234) for product labeling.", timeEstimate: "3 - 5 Days" }
    ],
    requiredDocuments: [
      { docName: "Test Report from BIS-Recognized Laboratory (less than 90 days old)", format: "PDF", isMandatory: true },
      { docName: "Brand Owner Authorization Form / Trademark Certificate", format: "PDF", isMandatory: true },
      { docName: "Affidavit cum Undertaking from Authorized Indian Representative (AIR)", format: "PDF", isMandatory: true },
      { docName: "Company Registration / Business License", format: "PDF", isMandatory: true }
    ],
    portalUrl: "https://www.crsbis.in",
    feeStructure: {
      applicationFee: "₹15,000 per application / brand",
      inspectionFee: "N/A (No factory visit required under CRS)",
      markingFee: "₹1,000 per year"
    }
  },
  {
    schemeCode: "SCHEME_IV_FMCS",
    title: "Foreign Manufacturers Certification Scheme (FMCS)",
    hindiTitle: "विदेशी निर्माता प्रमाणन योजना (एफ.एम.सी.एस.)",
    description: "Enables overseas manufacturers to obtain a BIS license to mark their products with the ISI Mark for export to India. Requires appointment of an Authorized Indian Representative (AIR).",
    eligibleEntities: "Overseas manufacturing units outside India desiring to export goods to India under mandatory or voluntary BIS standards.",
    procedureSteps: [
      { stepNo: 1, title: "Appointment of Authorized Indian Representative (AIR)", description: "Overseas firm appoints an Indian resident or entity to act as legal representative.", timeEstimate: "1 - 3 Days" },
      { stepNo: 2, title: "Application & Factory Audit Scheduling", description: "Submit application on Manakonline and pay audit travel and inspection charges.", timeEstimate: "30 - 45 Days" },
      { stepNo: 3, title: "On-site Factory Inspection Abroad", description: "BIS audit team visits foreign manufacturing plant for physical audit and sample drawing.", timeEstimate: "3 - 5 Days on site" },
      { stepNo: 4, title: "Sample Testing & Grant of License", description: "Drawn samples tested in India; upon compliance, CM/L license is granted.", timeEstimate: "30 - 60 Days" }
    ],
    requiredDocuments: [
      { docName: "Authorized Indian Representative (AIR) Agreement & ID proof", format: "PDF", isMandatory: true },
      { docName: "Overseas Factory Registration License / Certificate of Incorporation", format: "PDF", isMandatory: true },
      { docName: "Complete In-house Testing Setup & Factory Layout", format: "PDF", isMandatory: true },
      { docName: "Performance Bank Guarantee (PBG) of USD 10,000", format: "PDF", isMandatory: true }
    ],
    portalUrl: "https://www.manakonline.in/MANAK/FMCSApplication",
    feeStructure: {
      applicationFee: "USD 1,000",
      inspectionFee: "Travel, hotel, and daily allowance for BIS officer audit abroad",
      markingFee: "As per USD product schedule"
    }
  },
  {
    schemeCode: "HALLMARKING",
    title: "BIS Hallmarking Scheme for Precious Metals (Gold & Silver)",
    hindiTitle: "कीमती धातुओं के लिए बीआईएस हॉलमार्किंग योजना",
    description: "Certification of purity and fineness of gold and silver jewellery. Protects consumers from adulteration and ensures third-party assaying through Assaying & Hallmarking Centres (AHC).",
    eligibleEntities: "Registered jewellery retailers, wholesalers, and BIS-recognized Assaying and Hallmarking Centres.",
    procedureSteps: [
      { stepNo: 1, title: "Jeweller Online Registration", description: "Free online registration for jewellers on manakonline portal with GST and PAN details.", timeEstimate: "1 Day" },
      { stepNo: 2, title: "Submission of Jewellery to AHC", description: "Jeweller brings gold ornaments to recognized AHC with invoice.", timeEstimate: "Same Day" },
      { stepNo: 3, title: "XRF & Fire Assay Testing", description: "AHC tests purity of alloy using spectrometer and fire assaying.", timeEstimate: "4 - 6 Hours" },
      { stepNo: 4, title: "Laser Inscription of 6-digit HUID", description: "Laser engraving of BIS logo, purity (e.g. 22K916), and unique 6-character HUID on each piece.", timeEstimate: "1 Hour" }
    ],
    requiredDocuments: [
      { docName: "GST Registration Certificate of Jewellery Establishment", format: "PDF", isMandatory: true },
      { docName: "PAN Card of Business / Proprietor", format: "PDF", isMandatory: true },
      { docName: "Proof of Outlet Address & Shop Establishment License", format: "PDF", isMandatory: true }
    ],
    portalUrl: "https://www.manakonline.in/MANAK/hallmarking",
    feeStructure: {
      applicationFee: "Free for Jewellers (Turnover up to ₹5 Cr)",
      inspectionFee: "Zero",
      markingFee: "₹35 + GST per gold article, ₹25 + GST per silver article at AHC"
    }
  },
  {
    schemeCode: "ECO_MARK",
    title: "ECO Mark Scheme for Environmentally Friendly Products",
    hindiTitle: "पर्यावरण अनुकूल उत्पादों के लिए इको मार्क योजना",
    description: "Administered by BIS to label consumer products that meet specific environmental criteria along with the quality requirements of Indian Standards.",
    eligibleEntities: "Manufacturers of detergents, paints, paper, plastics, batteries, food items, and textiles.",
    procedureSteps: [
      { stepNo: 1, title: "Application with ISI Standard License", description: "Product must first hold or apply concurrently for standard ISI certification.", timeEstimate: "1 - 2 Days" },
      { stepNo: 2, title: "Environmental Criteria Testing", description: "Biodegradability, heavy metal absence, recyclability tests in designated environmental laboratories.", timeEstimate: "15 - 30 Days" },
      { stepNo: 3, title: "Grant of ECO Mark License", description: "Grant of license to affix the iconic Earthen Pot (Matka) ECO Mark along with ISI Mark.", timeEstimate: "7 Days" }
    ],
    requiredDocuments: [
      { docName: "Consent to Operate from State Pollution Control Board (SPCB)", format: "PDF", isMandatory: true },
      { docName: "Environmental Impact Assessment & Biodegradability test report", format: "PDF", isMandatory: true }
    ],
    portalUrl: "https://www.services.bis.gov.in",
    feeStructure: {
      applicationFee: "₹1,000",
      inspectionFee: "₹7,000",
      markingFee: "Special subsidized rate alongside ISI mark"
    }
  },
  {
    schemeCode: "LABORATORY_RECOGNITION",
    title: "Laboratory Recognition Scheme (LRS)",
    hindiTitle: "प्रयोगशाला मान्यता योजना",
    description: "Recognition of commercial and institutional testing laboratories across India to test conformity samples drawn during BIS factory audits and market surveillance.",
    eligibleEntities: "NABL-accredited chemical, electrical, mechanical, and biological testing laboratories in India.",
    procedureSteps: [
      { stepNo: 1, title: "Online LRS Application", description: "Submit scope of testing matching specific Indian Standards.", timeEstimate: "1 - 3 Days" },
      { stepNo: 2, title: "Assessment by BIS Technical Audit Team", description: "Evaluation of testing equipment, lab environmental controls, proficiency testing records.", timeEstimate: "30 Days" },
      { stepNo: 3, title: "Grant of Recognition", description: "Empanelment of lab in BIS Laboratory Network with official validity of 3 years.", timeEstimate: "15 Days" }
    ],
    requiredDocuments: [
      { docName: "NABL Accreditation Certificate & Detailed Test Scope", format: "PDF", isMandatory: true },
      { docName: "Proficiency Testing (PT) and Inter-Laboratory Comparison (ILC) reports", format: "PDF", isMandatory: true }
    ],
    portalUrl: "https://www.services.bis.gov.in/php/BIS_2.0/lab-home",
    feeStructure: {
      applicationFee: "₹10,000",
      inspectionFee: "₹25,000 per assessment",
      markingFee: "N/A"
    }
  }
];

export const BIS_SEED_GRIEVANCES: GrievanceSeed[] = [
  {
    topic: "Reporting Fake or Misused ISI Mark Products",
    category: "FAKE_ISI_MARK",
    description: "If you purchase a product bearing a counterfeit ISI Mark, missing a 7-digit CM/L license number, or where quality is severely substandard.",
    stepsToReport: [
      "Check the product packaging for the 7-digit CM/L (Certification Marks License) number under the ISI logo.",
      "Open the official **BIS Care App** (available on Android & iOS) and tap on 'Verify License Details' (CM/L).",
      "If the license is invalid, expired, or belongs to another product, select 'File a Complaint' in the app.",
      "Upload photographs of the product, packaging, ISI mark label, and tax invoice.",
      "BIS Enforcement Branch conducts raids and initiates prosecution under Section 14 and Section 15 of the BIS Act, 2016 (Penalty: Fine up to ₹5 Lakhs and up to 2 years imprisonment)."
    ],
    bisCareAppAction: "Tap 'Verify CM/L' -> If Invalid -> Tap 'Complaints' -> Select 'Misuse of ISI Mark' -> Submit Photo Proof",
    legalProvisions: "Section 14 & 15 of BIS Act, 2016 prohibits unauthorized use of Standard Mark. Offences are cognizable.",
    contactHelpline: "1800 11 1204 (Toll-Free National Helpline)",
    onlinePortalUrl: "https://www.services.bis.gov.in/php/BIS_2.0/dgda/grievance/consumer-complaints"
  },
  {
    topic: "Verifying Hallmarked Gold Jewellery & Reporting Fraud",
    category: "HALLMARK_FRAUD",
    description: "How consumers can verify authentic gold jewellery purity using the 6-digit Hallmark Unique Identification (HUID) and report under-karatage or fake hallmarks.",
    stepsToReport: [
      "Look for the 3 mandatory hallmarks on your gold jewellery piece: 1) BIS Logo, 2) Purity in Karat (e.g., 22K916), 3) 6-digit alphanumeric HUID.",
      "Open the **BIS Care Mobile App** and click on 'Verify HUID'.",
      "Enter the 6-digit code engraved on the ornament.",
      "The app will display: Jeweller Registration Number, Assaying Centre (AHC) details, Date of Hallmarking, Article Type, and Purity.",
      "If the HUID is not found or details mismatch, file a complaint directly in the app. The consumer is entitled to compensation for any purity shortfall as per BIS Regulations."
    ],
    bisCareAppAction: "Open BIS Care App -> Click 'Verify HUID' -> Enter 6-digit alphanumeric code -> View Jeweller & Purity report.",
    legalProvisions: "Rule 11 of BIS (Hallmarking) Regulations 2018: Jeweller must compensate the consumer with 2x the difference in gold purity value if under-karatage is proven.",
    contactHelpline: "1800 11 1204",
    onlinePortalUrl: "https://www.services.bis.gov.in"
  },
  {
    topic: "Substandard Quality of Mandatory QCO Product (Cement, Steel, Water, Helmets, Toys)",
    category: "SUBSTANDARD_PRODUCT",
    description: "Reporting manufacturers or shops selling non-certified, unsafe products notified under mandatory Quality Control Orders.",
    stepsToReport: [
      "Verify whether the product is covered under a mandatory QCO (e.g. Toys, Packaged Water, Helmets, Cement).",
      "Collect invoice/bill from the retailer.",
      "File grievance via BIS Care App or email to 'complaints@bis.gov.in' with retailer address and batch number.",
      "BIS inspection officers will draw surveillance samples and take legal action against non-compliant suppliers."
    ],
    bisCareAppAction: "Tap 'Complaints' -> Choose 'Substandard Product / Non-Certified Sale' -> Attach invoice & location.",
    legalProvisions: "Selling mandatory QCO goods without BIS license is punishable under Section 17 & 29 of BIS Act 2016.",
    contactHelpline: "1800 11 1204",
    onlinePortalUrl: "https://www.services.bis.gov.in"
  }
];
