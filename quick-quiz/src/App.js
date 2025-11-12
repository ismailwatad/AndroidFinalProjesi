import React, { useState } from 'react';
import './App.css';
import QUESTIONS from './questions';
import QuestionCard from './components/QuestionCard';
import ResultsScreen from './components/ResultsScreen';

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswerClick = (selectedOption) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    // Bir sonraki soruya geç
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const isQuizFinished = currentQuestionIndex >= QUESTIONS.length;

  return (
    <div className="App">
      <h1 className="app-title">React Quiz'im</h1>
      {isQuizFinished ? (
        <ResultsScreen
          score={score}
          totalQuestions={QUESTIONS.length}
          onRestart={handleRestart}
        />
      ) : (
        <QuestionCard
          question={QUESTIONS[currentQuestionIndex]}
          onAnswerClick={handleAnswerClick}
        />
      )}
    </div>
  );
}

export default App;
