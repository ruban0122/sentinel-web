/**
 * Get the current authenticated user's company_id (client-side)
 * @param supabase The supabase client instance
 * @returns company_id or null if not found
 */
export async function getCurrentUserCompanyIdClient(supabase: any): Promise<string | null> {
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
