import { prisma } from '../config/prisma.js';

export interface ChecklistGenerateInput {
  standardNo: string;
  productName?: string;
  scale?: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
}

export class SchemesService {
  async getSchemes() {
    return prisma.certificationScheme.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async getSchemeByCode(schemeCode: any) {
    const scheme = await prisma.certificationScheme.findUnique({
      where: { schemeCode }
    });

    if (!scheme) {
      throw new Error('Certification Scheme not found');
    }

    return scheme;
  }

  /**
   * Generates a complete compliance roadmap and checklist for a manufacturer
   */
  async generateChecklist(input: ChecklistGenerateInput) {
    const standard = await prisma.standard.findFirst({
      where: {
        OR: [
          { isNumber: { contains: input.standardNo } },
          { standardNo: input.standardNo }
        ]
      }
    });

    const isMandatory = standard ? standard.isMandatoryQCO : true;
    const stdTitle = standard ? standard.title : `Standard Reference: ${input.standardNo}`;
    const keyReqs = standard?.keyRequirements ? (standard.keyRequirements as string[]) : [];

    return {
      standardNo: standard?.isNumber || input.standardNo,
      title: stdTitle,
      productName: input.productName || standard?.applicableProducts?.[0] || 'Specified Product',
      isMandatoryQCO: isMandatory,
      estimatedTimeline: standard?.testingDays ? `${standard.testingDays + 30} - ${standard.testingDays + 60} Days` : '45 - 90 Days',
      scale: input.scale || 'SMALL',
      roadmapSteps: [
        {
          phase: 'Phase 1: In-House Laboratory & Quality Setup',
          tasks: [
            'Procure and install calibrated testing equipment for daily batch testing.',
            'Maintain valid NABL calibration certificates for all pressure gauges, spectrometers, and weighing balances.',
            'Appoint qualified QC in-charge with degree in relevant technical branch.',
            'Establish raw material inspection registers conforming to incoming test parameters.'
          ]
        },
        {
          phase: 'Phase 2: Technical Documentation & SIT Acceptance',
          tasks: [
            'Accept the BIS Scheme of Inspection and Testing (SIT).',
            'Prepare manufacturing process flow chart showing critical control points.',
            'Prepare factory premises layout drawing indicating machinery locations and raw material storage.',
            'Compile machinery list with manufacturer name, capacity, and serial numbers.'
          ]
        },
        {
          phase: 'Phase 3: Online Manakonline Application',
          tasks: [
            'Create account on manakonline.in portal.',
            'Submit Form-1 application with application fee (₹1,000).',
            'Upload factory proof, machinery list, and QC personnel certificates.'
          ]
        },
        {
          phase: 'Phase 4: Factory Audit & Sample Testing',
          tasks: [
            'BIS Technical Officer inspection of factory premises and test verification.',
            'Drawing of independent test sample for verification in BIS Central Lab.',
            `Testing of sample parameter: ${keyReqs.slice(0, 3).join(', ') || 'Conformance to standard specifications.'}`,
            'Receipt of passing test report.'
          ]
        },
        {
          phase: 'Phase 5: Grant of License (CM/L) & ISI Marking',
          tasks: [
            'Deposit annual minimum marking fee and advance inspection charges.',
            'Receive 7-digit CM/L license number from BIS Regional Office.',
            'Affix authentic Standard ISI mark along with CM/L number on retail packaging.'
          ]
        }
      ],
      requiredDocuments: [
        'Certificate of Incorporation / Partnership Deed / GST Registration',
        'Valid Factory Lease Deed or Land Ownership Title + Electricity Bill',
        'List of Plant & Machinery with motor ratings and production capacities',
        'List of Testing Equipment with least count and calibration validity',
        'Test Certificates of Raw Materials',
        'Scheme of Inspection and Testing (SIT) Undertaking',
        'Brand Registration / Trademark Authorization Letter'
      ],
      keyTestParameters: keyReqs
    };
  }
}

export const schemesService = new SchemesService();
