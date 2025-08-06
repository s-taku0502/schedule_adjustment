import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../services/firebase';

const UserProfile = ({ user, onClose, onUpdate }) => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setDisplayName(userData.displayName || user.displayName || '');
      }
    } catch (error) {
      console.log('ユーザープロフィール読み込みエラー:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Firebaseのユーザープロフィールから初期値を設定
      setDisplayName(user.displayName || '');
      
      // Firestoreからユーザー情報を取得
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Firebase Authのプロフィールを更新
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim()
      });

      // Firestoreにユーザー情報を保存
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        email: user.email,
        lastUpdated: new Date()
      }, { merge: true });

      setSuccess('ユーザー名を更新しました');
      
      // 親コンポーネントに更新を通知
      if (onUpdate) {
        onUpdate();
      }

      // 2秒後に閉じる
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setError('ユーザー名の更新に失敗しました: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>ユーザー名設定</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="displayName">ユーザー名</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力してください"
              maxLength={50}
              disabled={loading}
            />
            <small>この名前は回答時に自動で入力されます</small>
          </div>

          <div className="form-group">
            <label>メールアドレス</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="disabled-input"
            />
            <small>メールアドレスは変更できません</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              キャンセル
            </button>
            <button type="submit" disabled={loading || !displayName.trim()}>
              {loading ? '保存中...' : '保存'}
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
