import { supabase } from '../lib/supabaseClient';

// Insert transaction
export async function addTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction]);
  return { data, error };
}

// Get all transactions
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');
  return { data, error };
}

// Update transaction
export async function updateTransaction(id, updatedData) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updatedData)
    .eq('id', id);
  return { data, error };
}

// Delete transaction
export async function deleteTransaction(id) {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  return { data, error };
}