import { supabase } from '../supabase';

export interface MoonshineBatch {
  id?: string;
  batch_name: string;
  proof: number;
   distiller: string;
  status: 'Fermenting' | 'Distilling' | 'Ready' | 'Bottled';
}

export const fetchBatches = async () => {
  const { data, error } = await supabase.from('moonshine_batches').select('*');
  if (error) {
    console.error('Error fetching batches:', error);
    return [];
  }
  return data as MoonshineBatch[];
};

export const createBatch = async (batch: MoonshineBatch) => {
  const { data, error } = await supabase.from('moonshine_batches').insert([batch]);
  if (error) {
    console.error('Error creating batch:', error);
    return null;
  }
  return data;
};
