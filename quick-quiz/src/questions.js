// Sorular dizisi
const QUESTIONS = [
  {
    id: 1,
    question: "Bir React uygulamasının yapı taşı nedir?",
    options: ["Component", "Prop", "State", "Hook"],
    correctAnswer: "Component",
  },
  {
    id: 2,
    question: "Bir parent'tan child'a nasıl veri aktarırsınız?",
    options: ["State", "Props", "JSX", "Functions"],
    correctAnswer: "Props",
  },
  {
    id: 3,
    question: "React'te state'i güncellemek için hangi hook kullanılır?",
    options: ["useEffect", "useState", "useContext", "useReducer"],
    correctAnswer: "useState",
  },
  {
    id: 4,
    question: "JSX'te bir JavaScript ifadesini kullanmak için hangi sözdizimi kullanılır?",
    options: ["{{ }}", "{ }", "[ ]", "( )"],
    correctAnswer: "{ }",
  },
  {
    id: 5,
    question: "React'te bir liste render etmek için hangi metod kullanılır?",
    options: [".forEach()", ".map()", ".filter()", ".reduce()"],
    correctAnswer: ".map()",
  },
];

export default QUESTIONS;

