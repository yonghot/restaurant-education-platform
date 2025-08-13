const { Low, JSONFile } = require('lowdb');
const path = require('path');

// Netlify Functions 핸들러
exports.handler = async function(event) {
  // 인포그래픽 파일명(예: kalguksu-induction.html)
  const { infographic } = event.queryStringParameters || {};
  if (!infographic) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'infographic 파라미터 필요' })
    };
  }

  // DB 파일 경로 (Netlify Functions는 /tmp 또는 상대경로 사용)
  const dbFile = path.resolve(__dirname, 'views.json');
  const adapter = new JSONFile(dbFile);
  const db = new Low(adapter);
  await db.read();
  db.data = db.data || { views: {} };
  db.data.views = db.data.views || {};

  // GET: 조회수 반환
  if (event.httpMethod === 'GET') {
    const count = db.data.views[infographic] || 0;
    return {
      statusCode: 200,
      body: JSON.stringify({ views: count })
    };
  }

  // POST: 조회수 증가
  if (event.httpMethod === 'POST') {
    db.data.views[infographic] = (db.data.views[infographic] || 0) + 1;
    await db.write();
    return {
      statusCode: 200,
      body: JSON.stringify({ views: db.data.views[infographic] })
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: '지원하지 않는 메서드' })
  };
}; 