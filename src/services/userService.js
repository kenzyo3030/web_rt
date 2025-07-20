import { supabase } from '../lib/supabaseClient';

// Insert user
export async function addUser(user) {
  const { data, error } = await supabase
    .from('users')
    .insert([user]);
  return { data, error };
}

// Get all users
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  return { data, error };
}

export async function updateUser(id, user) {
  return await supabase.from('users').update(user).eq('id', id);
}

export async function deleteUser(id) {
  return await supabase.from('users').delete().eq('id', id);
}