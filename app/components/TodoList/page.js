"use client";
import { Search, X, PlusCircle, CheckSquare, Square } from "lucide-react";
import { HiOutlineDocumentPlus } from "react-icons/hi2";
import { useTodos } from "../../TodoContext/page";
import { useState, useRef, useEffect } from "react";
import { toggleTaskCompletionInDB } from "../../lib/api";

export default function TodoList({ toggleEditor }) {
  const { todos, getTodoById, updateTodo } = useTodos();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSearch = (event) => {
    event.stopPropagation();
    setShowSearch((prev) => !prev);
    setSearchQuery("");
  };

  const filteredTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleTodoClick = (id) => {
    const selectedTodo = getTodoById(id);
    if (selectedTodo) {
      toggleEditor(selectedTodo);
    }
  };

  const handleToggleTaskCompletion = async (todo) => {
    const newStatus = await toggleTaskCompletionInDB(todo.id, todo.completed);
    if (newStatus !== false) {
      updateTodo(todo.id, { ...todo, completed: newStatus });
    }
  };

  return (
    <div className="max-w-md mx-auto h-[500px] flex flex-col bg-white shadow-lg rounded-lg relative font-sans">
      {/* Header */}
      <header className="bg-black text-white p-4 flex justify-between items-center rounded-t-lg">
        <button
          onClick={() =>
            toggleEditor({ id: null, title: "New Task", description: "", date: "" })
          }
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <HiOutlineDocumentPlus size={24} />
          <span className="tracking-wide">TODO</span>
        </button>
        <button onClick={toggleSearch} className="p-1">
          <Search size={20} />
        </button>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div
          ref={searchRef}
          className="absolute top-14 right-4 w-[85%] bg-white shadow-md rounded-md p-2 flex items-center gap-2 transition-all duration-300 border border-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          <Search size={16} className="text-gray-600" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full bg-transparent outline-none text-sm p-1 text-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={() => setShowSearch(false)}>
            <X size={16} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center bg-gray-100 p-4 rounded-lg shadow-md transition-all"
            >
              {/* Checkbox to mark as completed */}
              <button
                onClick={() => handleToggleTaskCompletion(todo)}
                className="mr-3 text-gray-600 hover:text-black"
              >
                {todo.completed ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>

              {/* Task Details */}
              <div
                onClick={() => handleTodoClick(todo.id)}
                className={`flex-1 cursor-pointer ${
                  todo.completed ? "line-through text-gray-500" : "text-gray-800"
                }`}
              >
                <h3 className="font-bold text-lg">{todo.title}</h3>
                <p className="text-sm">{todo.description}</p>
                <span className="text-xs text-gray-500">{todo.date}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-10">No tasks found.</p>
        )}
      </div>

      {/* Add Task Button at the Bottom */}
      <div className="p-4 flex justify-center border-t"></div>
    </div>
  );
}
