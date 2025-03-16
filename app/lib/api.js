import { supabase } from "./supabaseClient";

// Fetch the authenticated user
const getUser = async () => {
  const { data: user, error } = await supabase.auth.getUser();
  if (error || !user?.user?.id) {
    console.error("User not authenticated.");
    return null;
  }
  return user.user.id;
};

// Add a new todo
export const addTodoToDB = async (taskData) => {
  const userId = await getUser();
  if (!userId) return null;

  const { data, error } = await supabase.from("todos").insert([{ ...taskData, user_id: userId }]).select();
  if (error) {
    console.error("Error adding todo:", error);
    return null;
  }
  return data ? data[0] : null;
};

// Update an existing todo
export const updateTodoInDB = async (taskId, title, details) => {
  const userId = await getUser();
  if (!userId) return false;

  const { error } = await supabase
    .from("todos")
    .update({ title, details })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating todo:", error);
    return false;
  }
  return true;
};

// Delete a todo
export const deleteTodoFromDB = async (taskId) => {
  const userId = await getUser();
  if (!userId) return false;

  const { error } = await supabase.from("todos").delete().eq("id", taskId).eq("user_id", userId);
  if (error) {
    console.error("Error deleting todo:", error);
    return false;
  }
  return true;
};

// Toggle task completion
export const toggleTaskCompletionInDB = async (taskId, currentStatus) => {
  const userId = await getUser();
  if (!userId) return false;

  const newStatus = !currentStatus;

  const { error } = await supabase
    .from("todos")
    .update({ completed: newStatus })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating completion status:", error);
    return false;
  }
  return newStatus;
};