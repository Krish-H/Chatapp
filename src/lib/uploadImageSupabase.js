import { supabase } from '../config/supabase';

const uploadImageSupabase = async (file, userId) => {
  const filePath = `${userId}/${Date.now()}-${file.name}`;

  const { error } = await supabase
    .storage
    .from('chat-media')
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase
    .storage
    .from('chat-media')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export default uploadImageSupabase;
