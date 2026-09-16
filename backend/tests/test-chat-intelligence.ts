import { ragService } from '../src/ai/rag/ragService.js';

async function runTest() {
  console.log('=== TEST 1: First Question: Packaged Drinking Water ===');
  const history: { role: string; content: string }[] = [];
  
  const q1 = 'What is the standard for Packaged Drinking Water?';
  const r1 = await ragService.generateAnswer(q1, history);
  console.log('Q1:', q1);
  console.log('A1 Preview:\n', r1.answer.substring(0, 250));
  console.log('Intent:', r1.intent);
  
  history.push({ role: 'user', content: q1 });
  history.push({ role: 'assistant', content: r1.answer });

  console.log('\n=== TEST 2: Second Question: marking fee kya hota hai ===');
  const q2 = 'marking fee kya hota hai';
  const r2 = await ragService.generateAnswer(q2, history);
  console.log('Q2:', q2);
  console.log('A2 Preview:\n', r2.answer.substring(0, 350));
  console.log('Intent:', r2.intent);
  
  history.push({ role: 'user', content: q2 });
  history.push({ role: 'assistant', content: r2.answer });

  console.log('\n=== TEST 3: Third Question: maine kya puchha hai tumse ? ===');
  const q3 = 'maine kya puchha hai tumse ?';
  const r3 = await ragService.generateAnswer(q3, history);
  console.log('Q3:', q3);
  console.log('A3 Preview:\n', r3.answer);
  console.log('Intent:', r3.intent);

  console.log('\n=== TEST 4: Fourth Question: Switch to Cement ===');
  const q4 = 'Cement ke liye kya standard hai?';
  const r4 = await ragService.generateAnswer(q4, history);
  console.log('Q4:', q4);
  console.log('A4 Preview:\n', r4.answer.substring(0, 250));
  console.log('Intent:', r4.intent);
}

runTest().catch(console.error);
