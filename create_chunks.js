const fs = require('fs');
const path = require('path');

// 파일 읽기 함수
function readFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`파일 읽기 실패: ${filePath}`, error.message);
        return '';
    }
}

// 텍스트 정제 함수
function cleanText(text) {
    return text
        .replace(/==================================================/g, '')
        .replace(/파일: .*\.PNG/g, '')
        .replace(/내 스토리 \d+시간/g, '')
        .replace(/외식업 관련/g, '')
        .replace(/무엇이든 물어보세요/g, '')
        .replace(/CIII 5G \d+/g, '')
        .replace(/활동/g, '')
        .replace(/Facebook 보내기/g, '')
        .replace(/더 보기/g, '')
        .replace(/☑/g, '')
        .replace(/X/g, '')
        .replace(/f/g, '')
        .replace(/ㅇ 삼대/g, '')
        .replace(/ㅇ 삼대장/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// 청크로 분할 함수 (의미 단위로 분할)
function splitIntoChunks(text, maxLength = 1000) {
    // 문단 단위로 먼저 분할
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        const cleanParagraph = paragraph.trim();
        
        // 문단이 너무 길면 문장 단위로 분할
        if (cleanParagraph.length > maxLength) {
            const sentences = cleanParagraph.split(/[.!?。！？\n]+/).filter(s => s.trim().length > 10);
            let sentenceChunk = '';
            
            for (const sentence of sentences) {
                if ((sentenceChunk + sentence).length > maxLength && sentenceChunk.length > 0) {
                    chunks.push(sentenceChunk.trim());
                    sentenceChunk = sentence;
                } else {
                    sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
                }
            }
            
            if (sentenceChunk.trim()) {
                chunks.push(sentenceChunk.trim());
            }
        } else {
            // 문단이 적당한 크기면 그대로 사용
            if ((currentChunk + cleanParagraph).length > maxLength && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = cleanParagraph;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + cleanParagraph;
            }
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 50); // 너무 짧은 청크 제거
}

// 메인 처리 함수
async function processFiles() {
    console.log('데이터 파일 처리 시작...');
    
    const qaContent = readFileContent('public/data/요알남 무물보 Q&A 내용.txt');
    const ebookContent = readFileContent('public/data/전자책 내용_외식업, 이것만 알면 끝.txt');
    
    console.log(`Q&A 파일 크기: ${qaContent.length} 문자`);
    console.log(`전자책 파일 크기: ${ebookContent.length} 문자`);
    
    // 텍스트 정제
    const cleanQaContent = cleanText(qaContent);
    const cleanEbookContent = cleanText(ebookContent);
    
    // 청크로 분할
    const qaChunks = splitIntoChunks(cleanQaContent, 800);
    const ebookChunks = splitIntoChunks(cleanEbookContent, 800);
    
    console.log(`Q&A 청크 수: ${qaChunks.length}`);
    console.log(`전자책 청크 수: ${ebookChunks.length}`);
    
    // 청크 데이터 구조화
    const allChunks = [];
    
    // Q&A 청크 추가
    qaChunks.forEach((chunk, index) => {
        allChunks.push({
            id: `qa_${index + 1}`,
            text: chunk,
            source: '요알남 무물보 Q&A',
            category: 'qa',
            length: chunk.length
        });
    });
    
    // 전자책 청크 추가
    ebookChunks.forEach((chunk, index) => {
        allChunks.push({
            id: `ebook_${index + 1}`,
            text: chunk,
            source: '전자책 내용',
            category: 'ebook',
            length: chunk.length
        });
    });
    
    // 청크 정보 출력
    console.log('\n=== 청크 통계 ===');
    console.log(`총 청크 수: ${allChunks.length}`);
    console.log(`평균 청크 길이: ${Math.round(allChunks.reduce((sum, chunk) => sum + chunk.length, 0) / allChunks.length)} 문자`);
    console.log(`최소 청크 길이: ${Math.min(...allChunks.map(chunk => chunk.length))} 문자`);
    console.log(`최대 청크 길이: ${Math.max(...allChunks.map(chunk => chunk.length))} 문자`);
    
    // 청크 샘플 출력
    console.log('\n=== 청크 샘플 ===');
    allChunks.slice(0, 3).forEach((chunk, index) => {
        console.log(`\n[${index + 1}] ${chunk.source} - ${chunk.id}`);
        console.log(`길이: ${chunk.length} 문자`);
        console.log(`내용: ${chunk.text.substring(0, 200)}...`);
    });
    
    // JSON 파일로 저장
    const outputData = {
        metadata: {
            totalChunks: allChunks.length,
            qaChunks: qaChunks.length,
            ebookChunks: ebookChunks.length,
            createdAt: new Date().toISOString(),
            version: '2.0'
        },
        chunks: allChunks
    };
    
    fs.writeFileSync('chunks_processed.json', JSON.stringify(outputData, null, 2), 'utf8');
    console.log('\n✅ 청크 데이터가 chunks_processed.json에 저장되었습니다.');
    
    return allChunks;
}

// 스크립트 실행
if (require.main === module) {
    processFiles().catch(console.error);
}

module.exports = { processFiles, splitIntoChunks, cleanText }; 