import React from "react";
import "./styles.css";
import { render } from "react-dom";

function Title() {
  return (
    <div className="App">
      <h1>Hangman</h1>
      <h2>Find the hidden word - Enter a letter!</h2>
    </div>
  );
}

function Pillar() {
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="green"
      stroke-width="4"
      fill="yellow"
    />
  );
}

function Head() {
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="green"
      stroke-width="4"
      fill="yellow"
    />
  );
}
function Body() {
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="green"
      stroke-width="4"
      fill="yellow"
    />
  );
}
function LeftHand() {
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="green"
      stroke-width="4"
      fill="yellow"
    />
  );
}
function RightHand() {
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="green"
      stroke-width="4"
      fill="yellow"
    />
  );
}
function LeftLeg() {
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="green"
      stroke-width="4"
      fill="yellow"
    />
  );
}
function RightLeg() {
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      stroke="green"
      stroke-width="4"
      fill="yellow"
    />
  );
}
function Hangman() {
  return (
    <div>
      <Head />
      <Body />
      <LeftHand />
      <RightHand />
      <LeftLeg />
      <RightLeg />
    </div>
  );
}

function ContHangman() {
  return (
    <svg width="100" height="100">
      <Pillar />
      <Hangman />
    </svg>
  );
}

function ContWrong() {
  return (
    <div>
      <h6>Wrong</h6>
      <ul>
        <li>a</li>
      </ul>
    </div>
  );
}

function ContHangmanWrong() {
  return (
    <div>
      <ContHangman />
      <ContWrong />
    </div>
  );
}

function ContGame() {
  return (
    <div>
      <ContHangmanWrong />
      <ContWord />
    </div>
  );
}

function ContWord() {
  return <h6> word</h6>;
}

export default function App() {
  return (
    <div>
      <Title />;
      <ContGame />
    </div>
  );
}
