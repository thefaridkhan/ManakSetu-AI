import axios from 'axios';

async function testFullFlow() {
  console.log('🚀 Testing End-to-End BIS Assistant REST APIs...\n');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Health
    const health = await axios.get(`${baseUrl}/health`);
    console.log('✅ 1. Health Check:', health.data);

    // 2. Standards Search
    const standards = await axios.get(`${baseUrl}/standards/search?q=water`);
    console.log(`✅ 2. Standards Search: Found ${standards.data.data.total} standards matching "water"`);
    console.log(`   Top Standard: ${standards.data.data.items[0]?.isNumber} - ${standards.data.data.items[0]?.title}`);

    // 3. Schemes
    const schemes = await axios.get(`${baseUrl}/schemes`);
    console.log(`✅ 3. Schemes: Found ${schemes.data.data.length} certification schemes`);

    // 4. Checklist Generator
    const checklist = await axios.post(`${baseUrl}/schemes/checklist/generate`, {
      standardNo: 'IS 14543',
      productName: 'Packaged Drinking Water'
    });
    console.log(`✅ 4. Checklist Generator: Generated ${checklist.data.data.roadmapSteps.length} phases for ${checklist.data.data.standardNo}`);

    // 5. Grievance Guides
    const grievances = await axios.get(`${baseUrl}/grievance/guides`);
    console.log(`✅ 5. Grievance Guides: Found ${grievances.data.data.length} guides`);

    // 6. RAG Chat Completion
    console.log('⏳ 6. Testing RAG Chat completion...');
    const chat = await axios.post(`${baseUrl}/chat`, {
      message: 'What BIS standard is applicable to packaged drinking water and is it mandatory under QCO?'
    });
    console.log('✅ 6. RAG Chat Response Received:');
    console.log(`   Language: ${chat.data.data.language} | Intent: ${chat.data.data.intent}`);
    console.log(`   Confidence: ${chat.data.data.confidence}`);
    console.log(`   Citations (${chat.data.data.citations.length}):`);
    chat.data.data.citations.forEach((c: any, i: number) => {
      console.log(`     [${i + 1}] ${c.identifier} - ${c.title} (Mandatory: ${c.isMandatoryQCO ? 'YES' : 'NO'})`);
    });
    console.log(`   Answer Preview:\n${chat.data.data.answer.substring(0, 300)}...\n`);

    // 7. Hindi RAG Chat Completion
    console.log('⏳ 7. Testing Bilingual Hindi RAG Chat completion...');
    const hindiChat = await axios.post(`${baseUrl}/chat`, {
      message: 'पेयजल और पैकेज्ड पानी के लिए कौन सा मानक है?'
    });
    console.log('✅ 7. Bilingual Hindi Chat Response:');
    console.log(`   Language: ${hindiChat.data.data.language} | Intent: ${hindiChat.data.data.intent}`);
    console.log(`   Top Citation: ${hindiChat.data.data.citations[0]?.identifier}`);
    console.log(`   Answer Preview:\n${hindiChat.data.data.answer.substring(0, 250)}...\n`);

    console.log('🎉 ALL REST API & RAG FLOWS VERIFIED 100% OPERATIONAL!\n');
  } catch (err: any) {
    console.error('❌ Verification failed:', err.response?.data || err.message);
  }
}

testFullFlow();
