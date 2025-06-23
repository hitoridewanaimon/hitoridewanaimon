// pages/firebase.js の修正

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:  "AIzaSyB7hj1ShwNgblj_Ukv6N7lxB64gTJ-A0uo", // 例: "AIzaSy...XYZ"
  authDomain: "hitoridewanaimon.firebaseapp.com", // 例: "my-project-12345.firebaseapp.com"
  projectId: "hitoridewanaimon",// 例: "my-project-12345"
  storageBucket: "hitoridewanaimon.firebasestorage.app", // 例: "my-project-12345.appspot.com"
  messagingSenderId:  "401986398432",  // ここが問題の箇所。値が文字列であることを確認し、引用符で囲む
  appId: "1:401986398432:web:e22b5ebe825ce923a4885", // 例: "1:..."
  // measurementId: "G-XXXXXXXXXX" // Analyticsを使う場合
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// 各Firebaseサービスへの参照を取得し、エクスポートします
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;