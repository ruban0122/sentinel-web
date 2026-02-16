export type Site = {
    id: string
    name: string
    company_id: string
    status: string | null
    latitude: number | null
    longitude: number | null
    created_at: string
}

export type Worker = {
    id: string
    worker_code: string | null
    name: string | null
    rfid_tag: string | null
    status: string | null
    company_id: string | null
    site_id: string | null
    section_id: string | null
    department_id: string | null
    created_at: string
}

export type Attendance = {
    id: string
    worker_id: string | null
    worker_code: string | null
    rfid_tag: string | null
    status: string | null
    site_id: string | null
    company_id: string | null
    floor_id: string | null
    check_in_time: string | null
    check_out_time: string | null
    date: string | null
}

export type User = {
    id: string
    uid: string | null
    name: string | null
    email: string | null
    role: string | null
    phone_number: string | null
    profile_image_url: string | null
    company_id: string | null
    created_at: string
}

export type Incident = {
    id: string
    description: string | null
    image_url: string | null
    worker_id: string | null
    worker_name: string | null
    company_id: string | null
    site_id: string | null
    section_id: string | null
    department_id: string | null
    created_at: string
    date: string | null
}
