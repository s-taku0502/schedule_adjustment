import React from 'react';
import '../App.css';

const UsageGuide = ({ onNavigateToHost, onNavigateToJoin }) => {
  return (
    <div className="container">
      <div className="header">
        <button 
          className="back-button"
          onClick={() => window.history.back()}
        >
          ← 戻る
        </button>
        <h1>スケジュール調整アプリの使い方</h1>
      </div>

      <div className="usage-content">
        <section className="usage-section">
          <h2>📱 アプリの特徴</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>✅ ログインで履歴が保存されます</h3>
              <p>
                Googleアカウントでログインすることで、過去の回答履歴が自動的に保存されます。
                次回同じ参加者として回答する際は、前回の内容が自動で入力されるため、
                手間を省くことができます。
              </p>
            </div>
            
            <div className="feature-item">
              <h3>🔐 ログインを強く推奨します</h3>
              <p>
                ログインしていない場合、ブラウザを閉じると回答履歴が失われてしまいます。
                継続的にアプリを利用される場合は、必ずGoogleアカウントでログインしてください。
              </p>
            </div>
            
            <div className="feature-item">
              <h3>🔗 共有リンクを貼るだけで簡単参加</h3>
              <p>
                イベント作成者から送られてくる共有リンクをクリックするだけで、
                すぐにスケジュール調整に参加できます。面倒な登録や設定は一切不要です。
              </p>
            </div>
          </div>
        </section>

        <section className="usage-section">
          <h2>🎯 基本的な使い方</h2>
          
          <div className="usage-steps">
            <div className="step">
              <h3>1. イベント作成者の場合</h3>
              <ul>
                <li>「イベントを作成」をクリック</li>
                <li>イベント名、候補日時、説明を入力</li>
                <li>作成後に表示される共有リンクを参加者に送信</li>
                <li>回答状況をリアルタイムで確認</li>
              </ul>
              <button 
                className="guide-button primary-button" 
                onClick={onNavigateToHost}
              >
                イベントを作成する
              </button>
            </div>

            <div className="step">
              <h3>2. 参加者の場合</h3>
              <ul>
                <li>送られてきた共有リンクをクリック</li>
                <li>参加者名を入力（ログイン済みの場合は自動入力）</li>
                <li>各候補日時に対して「○」「△」「×」で回答</li>
                <li>必要に応じてメモを追加</li>
                <li>「回答を送信」をクリック</li>
              </ul>
              <button 
                className="guide-button secondary-button" 
                onClick={onNavigateToJoin}
              >
                イベントに参加する
              </button>
            </div>
          </div>
        </section>

        <section className="usage-section">
          <h2>💡 便利な機能</h2>
          <div className="tips-list">
            <div className="tip-item">
              <h4>📊 結果の自動集計</h4>
              <p>参加者の回答は自動的に集計され、最適な日時が一目でわかります。</p>
            </div>
            
            <div className="tip-item">
              <h4>✏️ 回答の修正可能</h4>
              <p>一度回答した後でも、同じリンクから何度でも修正できます。</p>
            </div>
            
            <div className="tip-item">
              <h4>📱 モバイル対応</h4>
              <p>スマートフォンやタブレットからでも快適に利用できます。</p>
            </div>
            
            <div className="tip-item">
              <h4>🔄 リアルタイム更新</h4>
              <p>他の参加者の回答がリアルタイムで反映されます。</p>
            </div>
          </div>
        </section>

        <section className="usage-section login-recommendation">
          <h2>🚀 より便利に使うために</h2>
          <div className="recommendation-box">
            <h3>Googleアカウントでログインをお勧めします</h3>
            <ul>
              <li>回答履歴が自動保存される</li>
              <li>次回から参加者名が自動入力される</li>
              <li>過去の回答が自動で復元される</li>
              <li>複数のデバイスで同じ履歴を共有できる</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UsageGuide;
