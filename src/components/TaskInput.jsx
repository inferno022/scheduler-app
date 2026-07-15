import React, { useState } from 'react';

function TaskInput({ onAdd }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(inputValue);
    setInputValue('');
  };

  return (
    <form className="task-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-input"
        placeholder="What's next?"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button type="submit" className="add-button" disabled={!inputValue.trim()}>
        Add
      </button>
    </form>
  );
}

export default TaskInput;
