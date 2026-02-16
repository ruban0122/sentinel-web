import { createClient } from '@/lib/supabase/server'

/**
 * Get the current authenticated user's company_id
 * @returns company_id or null if not found
 */
export async function getCurrentUserCompanyId(): Promise<string | null> {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('Error getting user:', authError)
        return null
    }

    // Get the user's company_id from the users table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('uid', user.id)
        .single()

    if (userError || !userData) {
        console.error('Error getting user company:', userError)
        return null
    }

    return userData.company_id
}

