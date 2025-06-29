// pages/index.js
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase'; // firebase.jsからdbインスタンスをインポート

export default function Home() {
  const [posts, setPosts] = useState([]); // 投稿を格納するステート
  const [newPostContent, setNewPostContent] = useState(''); // 新しい投稿の入力内容

  // ★ 1. 既存の投稿を読み込む仕組み（アプリ起動時と投稿・応援後に更新）
  useEffect(() => {
    const fetchPosts = async () => {
      // 'posts'コレクションからデータを取得し、'createdAt'の昇順（古いものが下）で並べ替え
      const postsCollection = collection(db, 'posts');
      // orderBy('createdAt', 'asc') で古い投稿が下に表示されるようにします
      const q = query(postsCollection, orderBy('createdAt', 'desc')); 

      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    };

    fetchPosts(); // コンポーネントがマウントされたときに投稿をフェッチ
  }, []); // ページ読み込み時に一度だけ実行

  // ★ 2. 新しい書き込みを投稿する仕組み
  const handlePostSubmit = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ

    if (newPostContent.trim() === '') {
      alert('投稿内容を入力してください。');
      return;; // ここで処理を終了
    }

    try {
      // 'posts'コレクションに新しいドキュメントを追加
      await addDoc(collection(db, 'posts'), {
        content: newPostContent, // 投稿内容
        cheerCount: 0,           // 応援カウントの初期値
        createdAt: new Date()    // 投稿日時（この日時で並べ替えます）
      });
      setNewPostContent(''); // 入力フィールドをクリア

      // 投稿後、投稿リストを再取得して表示を更新
      const postsCollection = collection(db, 'posts');
      const q = query(postsCollection, orderBy('createdAt', 'desc')); // 再度昇順に並べ替え
      const querySnapshot = await getDocs(q);
      const updatedPostsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(updatedPostsData);
      alert('投稿が完了しました！');
    } catch (error) {
      console.error('投稿エラー:', error);
      alert('投稿中にエラーが発生しました。');
    }
  };

// ★ 3. 応援するねボタンが押されるたびにカウントされる仕組み
  const handleCheer = async (postId, currentCount) => {
    // ↓↓↓↓↓↓ ここに新しい行を追加します ↓↓↓↓↓↓
    console.log("応援ボタンがクリックされました！ postId:", postId, "現在のカウント:", currentCount); // ★★★ この行だけを追加 ★★★
    // ↑↑↑↑↑↑ ここに新しい行を追加しました ↑↑↑↑↑↑
    try { // ← ここから元の try ブロックが始まります

      // 特定の投稿ドキュメントへの参照を取得
      const postRef = doc(db, 'posts', postId);
      // カウントを1増やす
      await updateDoc(postRef, {
        cheerCount: currentCount + 1
      });
      // 画面上の表示を更新するため、postsステートも更新
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, cheerCount: currentCount + 1 } : post
        )
      );
    } catch (error) {
      console.error('応援エラー:', error);
      alert('応援中にエラーが発生しました。');
    }
  };
  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ひとりではないもん。</h1>
      <p>ようこそ、あなたは一人じゃない。</p>

      {/* 新しい書き込みフォーム */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>新しい悩みを投稿する</h2>
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="あなたの悩みを書いてみよう..."
            style={{ width: 'calc(100% - 16px)', minHeight: '100px', marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
            投稿する
          </button>
        </form>
      </div>

      {/* 投稿リスト */}
      <h2>みんなの悩み</h2>
      {posts.length === 0 ? (
        <p>まだ投稿がありません。最初の投稿をしてみましょう！</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f9f9f9', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '1.1em', marginBottom: '10px', lineHeight: '1.5' }}>{post.content}</p>
            <p style={{ fontSize: '0.8em', color: '#666', marginBottom: '10px' }}>
              投稿日時: {post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString() : '日付不明'}
            </p>
            <button
              onClick={() => handleCheer(post.id, post.cheerCount)}
              style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
            >
              応援するね！ ({post.cheerCount})
            </button>
          </div>
        ))
      )}
    </div>
  );
}