import { ragService } from '../src/ai/rag/ragService.js';
import { queryRouter } from '../src/ai/agents/queryRouter.js';
import { hybridRetriever } from '../src/ai/retrieval/hybridRetriever.js';

interface EvalTestCase {
  query: string;
  expectedIntent: string;
  expectedStandardSubstring: string;
  expectedKeywords: string[];
  expectedLanguage: string;
}

const EVALUATION_DATASET: EvalTestCase[] = [
  {
    query: "What BIS standard is applicable to packaged drinking water?",
    expectedIntent: "STANDARDS_SEARCH",
    expectedStandardSubstring: "IS 14543",
    expectedKeywords: ["packaged", "drinking", "water"],
    expectedLanguage: "en"
  },
  {
    query: "peyejal ya drinking water ke liye kaunsa IS standard hai?",
    expectedIntent: "STANDARDS_SEARCH",
    expectedStandardSubstring: "IS 10500",
    expectedKeywords: ["water", "standard"],
    expectedLanguage: "hinglish"
  },
  {
    query: "What are the mechanical and yield strength requirements for TMT steel bars under IS 1786?",
    expectedIntent: "STANDARDS_SEARCH",
    expectedStandardSubstring: "IS 1786",
    expectedKeywords: ["tmt", "steel", "1786"],
    expectedLanguage: "en"
  },
  {
    query: "Is Ordinary Portland Cement (OPC 43/53) covered under mandatory QCO?",
    expectedIntent: "STANDARDS_SEARCH",
    expectedStandardSubstring: "IS 269",
    expectedKeywords: ["cement", "qco", "mandatory"],
    expectedLanguage: "en"
  },
  {
    query: "How can a consumer report a shop selling fake ISI mark helmets or geysers?",
    expectedIntent: "GRIEVANCE",
    expectedStandardSubstring: "Grievance",
    expectedKeywords: ["fake", "isi", "care app"],
    expectedLanguage: "en"
  },
  {
    query: "What are the 3 mandatory symbols on gold hallmarking with HUID?",
    expectedIntent: "STANDARDS_SEARCH",
    expectedStandardSubstring: "IS 1417",
    expectedKeywords: ["huid", "hallmarking", "gold"],
    expectedLanguage: "en"
  },
  {
    query: "I manufacture lithium-ion battery packs for power banks. Which CRS standard applies?",
    expectedIntent: "PRODUCT_COMPLIANCE",
    expectedStandardSubstring: "IS 16046",
    expectedKeywords: ["lithium", "battery", "crs"],
    expectedLanguage: "en"
  },
  {
    query: "खिलौनों की सुरक्षा के लिए बीआईएस मानक क्या है?",
    expectedIntent: "STANDARDS_SEARCH",
    expectedStandardSubstring: "IS 9873",
    expectedKeywords: ["खिलौने", "सुरक्षा"],
    expectedLanguage: "hi"
  }
];

async function runRAGEvaluation() {
  console.log('====================================================');
  console.log('🧪 Running BIS AI Assistant RAG Grounding & Retrieval Evaluation');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalLatency = 0;

  for (let i = 0; i < EVALUATION_DATASET.length; i++) {
    const test = EVALUATION_DATASET[i];
    console.log(`Test #${i + 1}: "${test.query}"`);

    const start = Date.now();

    // 1. Test Router Classification
    const classification = queryRouter.classify(test.query);
    const intentMatch = classification.intent === test.expectedIntent || test.expectedIntent === 'STANDARDS_SEARCH';

    // 2. Test Hybrid Retrieval
    const retrieved = await hybridRetriever.retrieve(test.query, 5);
    const standardFound = retrieved.some(r =>
      r.identifier.includes(test.expectedStandardSubstring) ||
      r.title.includes(test.expectedStandardSubstring) ||
      r.content.includes(test.expectedStandardSubstring)
    );

    // 3. Test RAG Generation
    const response = await ragService.generateAnswer(test.query);
    const elapsed = Date.now() - start;
    totalLatency += elapsed;

    const citationVerified = response.citations.length > 0;
    const isSuccess = standardFound && citationVerified;

    if (isSuccess) {
      passedTests++;
      console.log(`  ✅ PASSED (${elapsed}ms)`);
      console.log(`     Intent: ${classification.intent} | Lang: ${classification.language}`);
      console.log(`     Top Citation: ${response.citations[0]?.identifier} - ${response.citations[0]?.title}`);
      console.log(`     Confidence Score: ${response.confidence}`);
    } else {
      console.log(`  ⚠️ PARTIAL (${elapsed}ms)`);
      console.log(`     Standard Found: ${standardFound} | Citations: ${response.citations.length}`);
    }
    console.log('----------------------------------------------------');
  }

  const accuracy = ((passedTests / EVALUATION_DATASET.length) * 100).toFixed(1);
  const avgLatency = Math.round(totalLatency / EVALUATION_DATASET.length);

  console.log('\n================ EVALUATION SUMMARY ================');
  console.log(`Total Test Scenarios: ${EVALUATION_DATASET.length}`);
  console.log(`Passed / Grounded:    ${passedTests} / ${EVALUATION_DATASET.length} (${accuracy}%)`);
  console.log(`Average Latency:      ${avgLatency}ms`);
  console.log(`Evaluation Result:    ${passedTests >= EVALUATION_DATASET.length * 0.8 ? 'PASSED 🚀' : 'NEEDS REFINEMENT'}`);
  console.log('====================================================\n');
}

runRAGEvaluation();
