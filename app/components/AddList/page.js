'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Trash, PlusCircle
} from 'lucide-react';
import { useTodos } from '../../TodoContext/page';
import { addTodoToDB, updateTodoInDB, deleteTodoFromDB }  from '../../lib/api';

const ToolbarButton = ({ onClick, Icon, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 hover:bg-gray-200 rounded-md transition ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <Icon size={18} />
  </button>
);

export default function TodoEditor({ selectedTodo, toggleEditor }) {
  const { addTodo, updateTodo, deleteTodo } = useTodos();
  const [title, setTitle] = useState(selectedTodo?.title || 'New Task');
  const [currentTaskId, setCurrentTaskId] = useState(selectedTodo?.id || null);
  const [Underline, setUnderline] = useState(null);
  const saveTimeout = useRef(null);

  useEffect(() => {
    import('@tiptap/extension-underline')
      .then((mod) => setUnderline(() => mod.default))
      .catch(() => setUnderline(null));
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ...(Underline ? [Underline] : []),
    ],
    content: selectedTodo?.details || '',
  });

  useEffect(() => {
    if (!selectedTodo) {
      setTitle("New Task");
      setCurrentTaskId(null);
      editor?.commands.clearContent();
      return;
    }

    setTitle(selectedTodo.title);
    setCurrentTaskId(selectedTodo.id);

    if (editor) {
      editor.commands.setContent(selectedTodo.details || "");
    }
  }, [selectedTodo, editor]);

  useEffect(() => {
    const timeoutRef = saveTimeout.current;
    return () => {
      if (timeoutRef) clearTimeout(timeoutRef);
    };
  }, []);

  const saveTask = async () => {
    if (!editor) return;

    const content = editor.getText().trim();
    if (!title.trim() && !content) return;

    const newTaskId = currentTaskId && currentTaskId.length === 36 ? currentTaskId : uuidv4();

    const taskData = {
      id: newTaskId,
      title: title.trim() || "Untitled Task",
      details: content,
      created_at: new Date().toISOString(),
    };

    if (!currentTaskId) {
      const newTask = await addTodoToDB(taskData);
      if (newTask) {
        setCurrentTaskId(newTask.id);
        addTodo(newTask);
      }
    } else {
      const success = await updateTodoInDB(currentTaskId, taskData.title, taskData.details);
      if (success) updateTodo(currentTaskId, taskData);
    }

    toggleEditor(taskData);
  };

  const handleDeleteTodo = async () => {
    if (!currentTaskId) return;

    const success = await deleteTodoFromDB(currentTaskId);
    if (success) {
      deleteTodo(currentTaskId);
      setCurrentTaskId(null);
      setTitle('New Task');
      editor?.commands.clearContent();
      toggleEditor(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <button onClick={() => toggleEditor(null)} className="flex items-center gap-1 text-lg font-bold">← Back</button>
      </div>

      {/* Title & Delete Button */}
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-bold text-lg bg-transparent focus:outline-none"
        />
        <button onClick={handleDeleteTodo} className="text-red-500">
          <Trash size={18} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-md bg-gray-100">
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} Icon={Bold} disabled={!editor} />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} Icon={Italic} disabled={!editor} />
        <ToolbarButton
          onClick={() => editor?.can().toggleUnderline() && editor?.chain().focus().toggleUnderline().run()}
          Icon={UnderlineIcon}
          disabled={!editor || Underline === null}
        />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} Icon={List} disabled={!editor} />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} Icon={ListOrdered} disabled={!editor} />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} Icon={AlignLeft} disabled={!editor} />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} Icon={AlignCenter} disabled={!editor} />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} Icon={AlignRight} disabled={!editor} />
      </div>

      {/* Editor Content */}
      <div className="p-2 rounded-md min-h-[100px] max-h-[300px] overflow-y-auto">
        {editor && <EditorContent editor={editor} />}
      </div>

      {/* Add Task Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={saveTask}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md shadow-md transition hover:bg-neutral-900 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!title.trim() && !editor?.getText().trim()}
        >
          <PlusCircle size={18} />
          Add Task
        </button>
      </div>
    </div>
  );
}
