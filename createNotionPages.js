const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });
const parentId = process.env.NOTION_PARENT_ID || '31ecd32d-90b5-80c5-8e06-caaf93d3ce1b';

async function createDatabase(title, icon, description, statusOptions = null) {
    const properties = {
        Name: { title: {} },
        Status: statusOptions ? {
            select: { options: statusOptions }
        } : { rich_text: {} }
    };

    try {
        const response = await notion.databases.create({
            parent: { type: 'page_id', page_id: parentId },
            title: [{ type: 'text', text: { content: title } }],
            icon: { type: 'emoji', emoji: icon },
            description: [{ type: 'text', text: { content: description } }],
            properties: properties
        });
        console.log(`Created DB: ${title}`);
        return response.id;
    } catch (error) {
        console.error(`Error creating ${title}:`, error.body || error.message);
    }
}

async function createPage(title, icon, textContent) {
    try {
        const blocks = textContent.split('\n\n').map(p => ({
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ type: 'text', text: { content: p } }] }
        }));

        const response = await notion.pages.create({
            parent: { type: 'page_id', page_id: parentId },
            icon: { type: 'emoji', emoji: icon },
            properties: {
                title: { title: [{ type: 'text', text: { content: title } }] }
            },
            children: blocks
        });
        console.log(`Created Page: ${title}`);
        return response.id;
    } catch (error) {
        console.error(`Error creating ${title}:`, error.body || error.message);
    }
}

async function run() {
    console.log('Starting Notion generation...');

    // 1. Create the methodologies explanation page
    const pkmContent = `このページは、世界中の効率化の達人たちが実践している「パーソナル・ナレッジ・マネジメント（PKM）」と、それをNotionでどう活かすかをまとめた解説ページです。

■ 1. Tiago Forte氏『CODEメソッド』と『PARAメソッド』
【動詞】集める・整理する・精製する・表現する
デジタルな「第2の脳」を作るための基礎。情報は「Inbox」に集め、Actionability（行動できるか）を基準に「Projects(今やる)」「Areas(継続する)」「Resources(参考にする)」「Archives(保管する)」に分ける最強のフォルダ構成です。

■ 2. David Allen氏『GTD (Getting Things Done)』
【動詞】書き出す・分類する・実行する
頭の中にある「やらなきゃいけないこと」をすべて手放し、システム（Inbox）に一極集中させるタスク管理の王道。「今やるべきこと」だけが手元に残るため、ストレスフリーになります。

■ 3. ニクラス・ルーマン『Zettelkasten（ツェッテルカステン）』
【動詞】書く・繋げる・考える
1つのノートに1つのアイデアだけを書き（アトミック）、それらをリンクで繋げていく知識整理法。Resourcesフォルダの中で、読書メモやアイデアを繋げて「新しい知識」を生み出すのに最適です。

■ 4. Ali Abdaal氏＆Thomas Frank氏のNotion活用
YouTube等で第一線で活躍する彼らは、これをNotionの「リレーショナルデータベース」で実現しています。
たとえば、Ali Abdaal氏は「Resonance Calendar（心に響いたことだけを保存するDB）」を作り、Thomas Frank氏は「Ultimate Brain（TaskとNoteを完全に分離しつつ紐付ける構造）」を作っています。

---
この『ALLs』ワークスペースは、これらの達人の知見を組み合わせ、「行動（動詞）」ベースで迷わずアクセスできるように設計しました。`;

    await createPage('🧠 達人たちのシステム設計論 (PKM, PARA, GTD)', '🧠', pkmContent);

    // 2. Create the PARA databases
    await createDatabase('1. 📥 Inbox (集める)', '📥', '何でもとりあえず放り込む「受信ルート」。週に1回、ここから他のDBに振り分けます。');

    await createDatabase('2. 🔥 Projects (作る・実行する)', '🔥', '明確なゴールと期限があるタスク・プロジェクト群。行動の要です。', [
        { name: '未着手', color: 'red' }, { name: '進行中', color: 'blue' }, { name: '完了', color: 'green' }
    ]);

    await createDatabase('3. 🌱 Areas (継続・維持する)', '🌱', '健康管理、学習記録、家計簿など、終わりがなく「習慣・維持」していく領域。');

    await createDatabase('4. 📚 Resources (参考にする・考える)', '📚', '気になる記事、読書メモ、資料、ノウハウなど。Zettelkastenのように情報を蓄積し、リンクさせます。');

    await createDatabase('5. 📦 Archives (保管する・忘れる)', '📦', '完了したプロジェクトや現在不要な資料の保管庫。普段は視界から消してスッキリさせます。');

    console.log('Finished creating structure in Notion.');
}

run();
