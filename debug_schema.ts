
import { createClient } from "@supabase/supabase-js";

// Use environment variables or hardcoded for test if env parsing fails (Assuming user has .env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectQuestions() {
    console.log("Fetching questions...");
    const { data, error } = await supabase
        .from('questions')
        .select(`*, profiles(full_name)`)
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        const q = data[0];
        console.log("Question Keys:", Object.keys(q));
        console.log("Has author_id?", 'author_id' in q);
        console.log("Has profile_id?", 'profile_id' in q);
    } else {
        console.log("No questions found.");
    }
}

inspectQuestions();
