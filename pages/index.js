// pages/index.js
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase'; // firebase.jsからdbインスタンスをインポート
import Image from 'next/image'; // イラスト表示のためにnext/imageをインポート

export default function Home() {
  const [posts, setPosts] = useState([]); // 投稿を格納するステート
  const [newPostContent, setNewPostContent] = useState(''); // 新しい投稿の入力内容

  // Audioオブジェクトを保持するためのRefを作成
  const audioRef = useRef(null);

  // コンポーネントのマウント時に投稿をフェッチし、Audioオブジェクトを初期化
  useEffect(() => {
    // Audioオブジェクトを作成
    // ★ 修正箇所：効果音ファイルのパスを修正
    // publicフォルダ直下の 'hitoridewanaimonpublicsounds' フォルダ内の 'cheer_sound.mp3' を想定
    audioRef.current = new Audio('/hitoridewanaimonpublicsounds/cheer_sound.mp3'); // ← このパスで試します
    audioRef.current.volume = 0.5; // 例: 半分の音量に設定

    const fetchPosts = async () => {
      const postsCollection = collection(db, 'posts');
      // 'createdAt'の降順（新しいものが上）で並べ替え
      const q = query(postsCollection, orderBy('createdAt', 'desc')); 
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    };

    fetchPosts(); // 投稿データをフェッチ
  }, []); // ページ読み込み時に一度だけ実行

  // 新しい書き込みを投稿する仕組み
  const handlePostSubmit = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信を防ぐ

    if (newPostContent.trim() === '') {
      alert('投稿内容を入力してください。');
      return; 
    }

    try {
      await addDoc(collection(db, 'posts'), {
        content: newPostContent,
        cheerCount: 0,
        createdAt: new Date()
      });
      setNewPostContent(''); // 入力フィールドをクリア

      // 投稿後、投稿リストを再取得して表示を更新
      const postsCollection = collection(db, 'posts');
      const q = query(postsCollection, orderBy('createdAt', 'desc')); // 投稿順を降順に統一
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

  // 応援するねボタンが押されるたびにカウントされる仕組み
  const handleCheer = async (postId, currentCount) => {
    console.log("応援ボタンがクリックされました！ postId:", postId, "現在のカウント:", currentCount);

    // 効果音を再生
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // 再生位置を最初に戻す（連続クリックで音が重なるのを防ぐ）
      audioRef.current.play().catch(error => {
        console.log("Audio playback prevented:", error);
      });
    }

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        cheerCount: currentCount + 1
      });
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
      
      {/* イラストを配置する部分 */}
      {/* publicフォルダ直下の 'publicimages' フォルダ内の 'hitori_illustration.png' を想定 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
        <Image
          src="/publicimages/hitori_illustration.png" // ★ 修正箇所：イラスト画像のパスを修正
          alt="ひとりではないもん。イラスト" // 画像の代替テキスト
          width={200} // 画像の幅をピクセルで指定 (適宜調整)
          height={150} // 画像の高さをピクセルで指定 (適宜調整)
          style={{ objectFit: 'contain' }} // 画像が指定サイズに収まるように調整
        />
      </div>

      <p>ようこそ、あなたは一人じゃない。</p>
      {/* Twitterアカウントリンク */}
      <p style={{ fontSize: '0.9em', color: '#555', marginTop: '5px' }}>
        運営: <a href="https://x.com/Sns1126940Sns" target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2', textDecoration: 'none' }}>@Sns1126940Sns</a>
      </p>

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