import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Firebaseのパスを確認
// Firebaseからデータを読み込むための機能
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore'; // ← updateDocを追加しました！

export default function Home() {
  const [cheerCount, setCheerCount] = useState(0);
  const [post, setPost] = useState(null);

  // アプリが読み込まれたときに、一度だけデータベースから投稿を読み込むための部分
  useEffect(() => {
    const fetchPost = async () => {
      const q = query(collection(db, "posts"));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 最初のドキュメント（今回作成した「最初の投稿」）を取得
        const docData = querySnapshot.docs[0]; // doc を docData に変更 (名前の衝突を避けるため)
        setPost({ id: docData.id, ...docData.data() }); // 投稿IDとデータをセット
        setCheerCount(docData.data().cheers); // データベースからの応援カウントを初期値に設定
      }
    };

    fetchPost();
  }, []);

  // 応援ボタンがクリックされたときの処理
  const handleCheerClick = async () => { // async を追加しました！
    // まず、現在のカウントを1増やす
    const newCheerCount = cheerCount + 1;
    setCheerCount(newCheerCount);
    console.log("応援するね！ボタンが押されました！現在のカウント:", newCheerCount);

    // データベースに新しいカウントを保存する
    if (post && post.id) { // postデータとIDがあることを確認
      const postRef = doc(db, "posts", post.id); // 参照を取得
      await updateDoc(postRef, { // データベースを更新
        cheers: newCheerCount
      });
      console.log("応援カウントをデータベースに保存しました:", newCheerCount);
    }
  };

  // 投稿データがまだ読み込まれていない場合は、ローディング表示
  if (!post) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: 40, textAlign: 'center' }}>
        <h1>読み込み中...</h1>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 40, textAlign: 'center' }}>
      <h1>ひとりではないもん。</h1>
      <p>ようこそ、あなたは一人じゃない。</p>
      <div style={{ marginTop: 30, padding: 20, border: '1px solid #eee', borderRadius: 8, backgroundColor: '#f9f9f9' }}>
        <p><strong>最初の投稿</strong></p>
        <p>{post.content}</p>
        <button
          onClick={handleCheerClick}
          style={{ padding: '10px 20px', borderRadius: 5, border: 'none', backgroundColor: '#a4d4b3', color: 'white', cursor: 'pointer', fontSize: '1em' }}
        >
          応援するね！ ({cheerCount})
        </button>
      </div>
      <button style={{ marginTop: 20, padding: '15px 30px', borderRadius: 25, border: 'none', backgroundColor: '#6a9c8f', color: 'white', cursor: 'pointer', fontSize: '1.2em' }}>
        ＋ 新しい悩みを投稿する
      </button>
    </div>
  );
}