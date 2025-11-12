import React from 'react';
import './ResultsScreen.css';

function ResultsScreen({ score, totalQuestions, onRestart }) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  return (
    <div className="results-screen">
      <div className="results-card">
        <h2 className="results-title">Quiz Bitti!</h2>
        <div className="score-display">
          <p className="score-text">
            {totalQuestions} sorudan <span className="score-number">{score}</span> tanesini doğru cevapladınız.
          </p>
          <p className="percentage-text">Başarı Oranı: %{percentage}</p>
        </div>
        <button className="restart-button" onClick={onRestart}>
          Quiz'i Yeniden Başlat
        </button>
      </div>
    </div>
  );
}

export default ResultsScreen;

