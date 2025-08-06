import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const HostDashboard = ({ user, onBack, onViewResults, showCreateForm: initialShowCreateForm = false, onCreateNew }) => {
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(initialShowCreateForm);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [candidateDates, setCandidateDates] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [defaultInPersonAvailable, setDefaultInPersonAvailable] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDates, setEditDates] = useState(['']);
  const [editDefaultInPerson, setEditDefaultInPerson] = useState(false);

  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        const q = query(
          collection(db, 'events'),
          where('hostId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const eventsData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const eventData = { id: doc.id, ...doc.data() };
            
            // 各イベントの回答数を取得
            const responsesRef = collection(db, 'events', doc.id, 'responses');
            const responsesSnapshot = await getDocs(responsesRef);
            eventData.responseCount = responsesSnapshot.size;
            
            return eventData;
          })
        );
        // JavaScriptでソート（createdAtで降順）
        eventsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });
        setEvents(eventsData);
      } catch (error) {
        console.error('イベント取得エラー:', error);
      }
    };

    loadUserEvents();
  }, [user]);

  const addDateInput = () => {
    setCandidateDates([...candidateDates, '']);
  };

  const updateDate = (index, value) => {
    const newDates = [...candidateDates];
    newDates[index] = value;
    setCandidateDates(newDates);
  };

  const removeDate = (index) => {
    const newDates = candidateDates.filter((_, i) => i !== index);
    setCandidateDates(newDates);
  };

  const createEvent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validDates = candidateDates.filter(date => date.trim() !== '');
      
      if (validDates.length === 0) {
        alert('候補日を少なくとも1つ入力してください');
        setLoading(false);
        return;
      }

      const eventData = {
        title: eventTitle,
        description: eventDescription,
        candidateDates: validDates,
        hostId: user.uid,
        hostName: user.displayName || user.email,
        defaultInPersonAvailable: defaultInPersonAvailable,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'events'), eventData);
      
      // フォームリセット
      setEventTitle('');
      setEventDescription('');
      setCandidateDates(['']);
      setDefaultInPersonAvailable(false);
      setShowCreateForm(false);
      
      // イベント一覧更新
      await loadUserEventsRefresh();
      
      alert('イベントが作成されました！');
    } catch (error) {
      console.error('イベント作成エラー:', error);
      alert('イベント作成に失敗しました');
    }
    
    setLoading(false);
  };

  const loadUserEventsRefresh = async () => {
    try {
      const q = query(
        collection(db, 'events'),
        where('hostId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const eventsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const eventData = { id: doc.id, ...doc.data() };
          
          // 各イベントの回答数を取得
          const responsesRef = collection(db, 'events', doc.id, 'responses');
          const responsesSnapshot = await getDocs(responsesRef);
          eventData.responseCount = responsesSnapshot.size;
          
          return eventData;
        })
      );
      // JavaScriptでソート（createdAtで降順）
      eventsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA;
      });
      setEvents(eventsData);
    } catch (error) {
      console.error('イベント取得エラー:', error);
    }
  };

  const viewEventResults = (eventId) => {
    if (onViewResults) {
      onViewResults(eventId);
    }
  };

  const copyShareLink = async (eventId) => {
    try {
      const shareUrl = `${window.location.origin}?eventId=${eventId}`;
      await navigator.clipboard.writeText(shareUrl);
      alert(`共有リンクをコピーしました！\n\nイベントID: ${eventId}\n\n参加者にこのリンクまたはイベントIDを共有してください。`);
    } catch (error) {
      // クリップボードAPIが使えない場合のフォールバック
      const shareUrl = `${window.location.origin}?eventId=${eventId}`;
      const fallbackText = `イベントID: ${eventId}\n共有リンク: ${shareUrl}`;
      
      // テキストエリアを作成してコピー
      const textArea = document.createElement('textarea');
      textArea.value = fallbackText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      alert(`共有情報をコピーしました！\n\nイベントID: ${eventId}\n\n参加者にこの情報を共有してください。`);
    }
  };

  // イベント削除機能
  const deleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`「${eventTitle}」を削除しますか？\n\nこの操作は取り消せません。参加者の回答もすべて削除されます。`)) {
      return;
    }

    setLoading(true);
    try {
      // イベントドキュメントを削除
      await deleteDoc(doc(db, 'events', eventId));
      
      // イベント一覧を再読み込み
      const q = query(
        collection(db, 'events'),
        where('hostId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const eventsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const eventData = { id: doc.id, ...doc.data() };
          
          // 各イベントの回答数を取得
          const responsesRef = collection(db, 'events', doc.id, 'responses');
          const responsesSnapshot = await getDocs(responsesRef);
          eventData.responseCount = responsesSnapshot.size;
          
          return eventData;
        })
      );
      eventsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA;
      });
      setEvents(eventsData);
      
      alert('イベントを削除しました');
    } catch (error) {
      console.error('イベント削除エラー:', error);
      alert('イベントの削除に失敗しました');
    }
    setLoading(false);
  };

  // 編集開始
  const startEdit = (event) => {
    setEditingEvent(event.id);
    setEditTitle(event.title);
    setEditDescription(event.description || '');
    setEditDates(event.candidateDates || ['']);
    setEditDefaultInPerson(event.defaultInPersonAvailable || false);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingEvent(null);
    setEditTitle('');
    setEditDescription('');
    setEditDates(['']);
    setEditDefaultInPerson(false);
  };

  // 編集候補日の操作
  const addEditDateInput = () => {
    setEditDates([...editDates, '']);
  };

  const updateEditDate = (index, value) => {
    const newDates = [...editDates];
    newDates[index] = value;
    setEditDates(newDates);
  };

  const removeEditDate = (index) => {
    const newDates = editDates.filter((_, i) => i !== index);
    setEditDates(newDates);
  };

  // イベント更新
  const updateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validDates = editDates.filter(date => date.trim() !== '');
      
      if (validDates.length === 0) {
        alert('候補日を少なくとも1つ入力してください');
        setLoading(false);
        return;
      }

      const updateData = {
        title: editTitle,
        description: editDescription,
        candidateDates: validDates,
        defaultInPersonAvailable: editDefaultInPerson,
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'events', editingEvent), updateData);
      
      // イベント一覧を再読み込み
      const q = query(
        collection(db, 'events'),
        where('hostId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const eventsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const eventData = { id: doc.id, ...doc.data() };
          
          // 各イベントの回答数を取得
          const responsesRef = collection(db, 'events', doc.id, 'responses');
          const responsesSnapshot = await getDocs(responsesRef);
          eventData.responseCount = responsesSnapshot.size;
          
          return eventData;
        })
      );
      eventsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA;
      });
      setEvents(eventsData);
      
      // 編集モード終了
      cancelEdit();
      alert('イベントを更新しました');
      
    } catch (error) {
      console.error('イベント更新エラー:', error);
      alert('イベントの更新に失敗しました');
    }
    setLoading(false);
  };

  return (
    <div className="host-dashboard">
      <div className="header">
        <button onClick={onBack} className="back-btn">← 戻る</button>
        <h2>ホストダッシュボード</h2>
        <p>ようこそ、{user.displayName || user.email}さん</p>
      </div>

      <div className="actions">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-btn"
        >
          {showCreateForm ? 'キャンセル' : '新しいイベントを作成'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <h3>新しいイベント作成</h3>
          <form onSubmit={createEvent}>
            <div className="form-group">
              <label htmlFor="event-title">イベントタイトル</label>
              <input
                id="event-title"
                name="eventTitle"
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="例: チームミーティング"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-description">説明（任意）</label>
              <textarea
                id="event-description"
                name="eventDescription"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="イベントの詳細や注意事項を記入してください"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>候補日程</label>
              {candidateDates.map((date, index) => (
                <div key={index} className="date-input">
                  <input
                    id={`candidate-date-${index}`}
                    name={`candidateDate${index}`}
                    type="date"
                    value={date}
                    onChange={(e) => updateDate(index, e.target.value)}
                    required={index === 0}
                  />
                  {candidateDates.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeDate(index)}
                      className="remove-btn"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={addDateInput}
                className="add-date-btn"
              >
                候補日を追加
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="default-in-person" className="checkbox-label">
                <input
                  id="default-in-person"
                  name="defaultInPersonAvailable"
                  type="checkbox"
                  checked={defaultInPersonAvailable}
                  onChange={(e) => setDefaultInPersonAvailable(e.target.checked)}
                />
                <span className="checkbox-text">参加者の対面会議を初期状態でONにする</span>
              </label>
              <small className="help-text">
                チェックすると、参加者の回答フォームで「対面での話し合いが可能」が初期選択されます
              </small>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? '作成中...' : 'イベント作成'}
            </button>
          </form>
        </div>
      )}

      <div className="events-list">
        <h3>作成したイベント</h3>
        {events.length === 0 ? (
          <p>まだイベントがありません</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              {editingEvent === event.id ? (
                // 編集モード
                <div className="edit-form">
                  <h4>イベント編集</h4>
                  <form onSubmit={updateEvent}>
                    <div className="form-group">
                      <label htmlFor={`edit-title-${event.id}`}>イベントタイトル</label>
                      <input
                        id={`edit-title-${event.id}`}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`edit-description-${event.id}`}>説明（任意）</label>
                      <textarea
                        id={`edit-description-${event.id}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="イベントの説明を入力してください"
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label>候補日</label>
                      {editDates.map((date, index) => (
                        <div key={index} className="date-input">
                          <input
                            type="text"
                            value={date}
                            onChange={(e) => updateEditDate(index, e.target.value)}
                            placeholder="例: 2024/01/15"
                            required
                          />
                          {editDates.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeEditDate(index)}
                              className="remove-date-btn"
                            >
                              削除
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        onClick={addEditDateInput}
                        className="add-date-btn"
                      >
                        候補日を追加
                      </button>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={editDefaultInPerson}
                          onChange={(e) => setEditDefaultInPerson(e.target.checked)}
                        />
                        デフォルトで対面可能とする
                      </label>
                    </div>

                    <div className="edit-actions">
                      <button type="submit" disabled={loading}>
                        {loading ? '更新中...' : '更新'}
                      </button>
                      <button type="button" onClick={cancelEdit}>
                        キャンセル
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // 通常表示モード
                <>
                  <h4>{event.title}</h4>
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                  <p><strong>イベントID:</strong> {event.id}</p>
                  <p>候補日: {event.candidateDates.join(', ')}</p>
                  <p>作成日: {event.createdAt?.toDate?.()?.toLocaleDateString?.() || '不明'}</p>
                  <p>回答数: {event.responseCount || 0}件</p>
                  <div className="event-actions">
                    <button onClick={() => viewEventResults(event.id)}>詳細を見る</button>
                    <button onClick={() => copyShareLink(event.id)}>共有リンクをコピー</button>
                    <button 
                      className="edit-btn"
                      onClick={() => startEdit(event)}
                    >
                      編集
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteEvent(event.id, event.title)}
                      disabled={loading}
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
