// Firebase SDK の初期化
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestoreを使うために追加

// あなたのFirebaseプロジェクトの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyB7hj1ShwNgblj_Ukv6N7lxB64gTJ-A0uo", // ← あなたの情報に置き換わります
  authDomain: "hitoridewanaimon.firebaseapp.com",
  projectId: "hitoridewanaimon",
  storageBucket: "hitoridewanaimon.firebasestorage.app",
  messagingSenderId: "401986398432",
  appId: "1:401986398432:web:0ccd25277b4d6c513a4885"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースへの参照を取得
const db = getFirestore(app);

// 他のファイルから利用できるようにエクスポート
export { db };