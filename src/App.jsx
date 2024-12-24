import { useEffect, useState } from "react";
import "./App.css";
import supabase from "./supabase-client";

function App() {
  const [todoList, setTodoList] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch todos when the component mounts
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch all todos from Supabase
  const fetchTodos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("TodoList").select("*");
    setLoading(false);

    if (error) {
      console.error("Error fetching todos:", error);
      setErrorMessage("Failed to fetch todos. Please try again later.");
    } else {
      setTodoList(data);
    }
  };

  // Add a new todo to Supabase
  const addTodo = async () => {
    if (!newTodo.trim()) {
      setErrorMessage("Todo cannot be empty!");
      return;
    }

    const newTodoData = { name: newTodo, isCompleted: false };
    const { data, error } = await supabase
      .from("TodoList")
      .insert([newTodoData])
      .single();

    if (error) {
      console.error("Error adding todo:", error);
      setErrorMessage("Failed to add todo. Please try again.");
    } else {
      setTodoList((prev) => [...prev, data]);
      setNewTodo("");
    }
  };

  // Toggle the completion status of a todo
  const toggleCompletion = async (id, isCompleted) => {
    const { data, error } = await supabase
      .from("TodoList")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.error("Error toggling completion:", error);
      setErrorMessage("Failed to update todo status. Please try again.");
    } else {
      setTodoList((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
        )
      );
    }
  };

  // Delete a todo from Supabase
  const deleteTodo = async (id) => {
    const { error } = await supabase.from("TodoList").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
      setErrorMessage("Failed to delete todo. Please try again.");
    } else {
      setTodoList((prev) => prev.filter((todo) => todo.id !== id));
    }
  };

  return (
    <div className="app">
      <h1>Todo List</h1>

      {/* Error Message */}
      {errorMessage && <p className="error">{errorMessage}</p>}

      {/* Input for adding a new todo */}
      <div className="input-container">
        <input
          type="text"
          placeholder="New Todo..."
          value={newTodo}
          onChange={(e) => {
            setNewTodo(e.target.value);
            setErrorMessage(""); // Clear error message on typing
          }}
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>

      {/* Loading indicator */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="todo-list">
          {todoList.map((todo) => (
            <li key={todo.id} className={todo.isCompleted ? "completed" : ""}>
              <div className="todo-item">
                <p>{todo.name}</p>
                <div className="buttons">
                  <button
                    onClick={() => toggleCompletion(todo.id, todo.isCompleted)}
                  >
                    {todo.isCompleted ? "Undo" : "Complete"}
                  </button>
                  <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
