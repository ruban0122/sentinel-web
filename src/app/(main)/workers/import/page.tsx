'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileUp, AlertCircle, CheckCircle, X, ChevronRight, Building2, Layers } from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'

type WorkerImportData = {
    name: string
    worker_code?: string
    rfid_tag: string
    status?: string
}

type ValidationResult = {
    valid: boolean
    errors: string[]
    data: WorkerImportData
}

type ImportStep = 'select' | 'upload' | 'preview' | 'confirm'

export default function ImportWorkersPage() {
    const [step, setStep] = useState<ImportStep>('select')
    const [selectedContractor, setSelectedContractor] = useState('')
    const [selectedFloor, setSelectedFloor] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ValidationResult[]>([])
    const [contractors, setContractors] = useState<any[]>([])
    const [floors, setFloors] = useState<any[]>([])
    const [isImporting, setIsImporting] = useState(false)
    const [companyId, setCompanyId] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [importResult, setImportResult] = useState<{ count: number, contractor: string, floor: string } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function init() {
            // Get current user and their company_id from profile
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('users')
                .select('company_id')
                .eq('uid', user.id)
                .single()

            const cid = profile?.company_id
            setCompanyId(cid)

            if (cid) {
                // Fetch contractors for this company
                const { data: contractorsData } = await supabase
                    .from('contractors')
                    .select('id, name, company_worker_code, floor_id')
                    .eq('company_id', cid)
                    .order('name')

                if (contractorsData) setContractors(contractorsData)
            }
        }
        init()
    }, [])

    // Fetch floor when contractor is selected
    useEffect(() => {
        async function fetchFloorForContractor() {
            if (!selectedContractor) {
                setFloors([])
                setSelectedFloor('')
                return
            }

            const contractor = contractors.find(c => c.id === selectedContractor)
            if (!contractor?.floor_id) {
                setFloors([])
                setSelectedFloor('')
                return
            }

            // Fetch the specific floor assigned to this contractor
            const { data: floorData } = await supabase
                .from('floors')
                .select(`
                    id, 
                    name, 
                    floor_code,
                    section_id,
                    sections(id, name, site_id, sites(name))
                `)
                .eq('id', contractor.floor_id)
                .single()

            if (floorData) {
                setFloors([floorData])
                // Auto-select the floor since there's only one
                setSelectedFloor(floorData.id)
            }
        }
        fetchFloorForContractor()
    }, [selectedContractor, contractors])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setFile(selectedFile)

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                validateData(results.data)
                setStep('preview')
            }
        })
    }

    const validateData = (data: any[]) => {
        const validated = data.map((row: any) => {
            const errors: string[] = []

            // Required fields
            if (!row.name?.trim()) errors.push('Name is required')
            if (!row.rfid_tag?.trim()) errors.push('RFID Tag is required')

            return {
                valid: errors.length === 0,
                errors,
                data: {
                    name: row.name?.trim(),
                    worker_code: row.worker_code?.trim(),
                    rfid_tag: row.rfid_tag?.trim(),
                    status: row.status?.toLowerCase() || 'active'
                }
            }
        })
        setParsedData(validated)
    }

    const handleImport = async () => {
        if (!companyId || !selectedContractor || !selectedFloor) return

        setIsImporting(true)
        const validRows = parsedData.filter(r => r.valid)

        try {
            // Get contractor and floor details
            const contractor = contractors.find(c => c.id === selectedContractor)
            const floor = floors.find(f => f.id === selectedFloor)

            const workersToInsert = validRows.map(r => ({
                id: crypto.randomUUID(),
                name: r.data.name,
                worker_code: r.data.worker_code || `WKR-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                rfid_tag: r.data.rfid_tag,
                status: r.data.status,
                company_id: companyId,
                // Set site_id and section_id from the floor
                site_id: floor?.sections?.site_id,
                section_id: floor?.section_id,
                created_at: new Date().toISOString()
            }))

            const { error } = await supabase.from('workers').insert(workersToInsert)

            if (error) throw error

            // Show success modal
            setImportResult({
                count: workersToInsert.length,
                contractor: contractor?.name || '',
                floor: floor?.name || ''
            })
            setShowSuccessModal(true)
        } catch (error: any) {
            alert('❌ Import failed: ' + error.message)
        } finally {
            setIsImporting(false)
        }
    }

    const validCount = parsedData.filter(r => r.valid).length
    const canProceedToUpload = selectedContractor && selectedFloor
    const canConfirm = validCount > 0

    const selectedContractorData = contractors.find(c => c.id === selectedContractor)
    const selectedFloorData = floors.find(f => f.id === selectedFloor)

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/workers"
                    className="hover-item"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'hsl(var(--muted-foreground))',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        textDecoration: 'none'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Workers
                </Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Import Workers</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                    Bulk upload workers by selecting contractor and floor, then uploading a CSV file
                </p>
            </div>

            {/* Progress Steps */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '2rem',
                padding: '1rem',
                background: 'hsl(var(--muted))',
                borderRadius: '0.75rem'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: step === 'select' ? 'hsl(var(--primary))' : 'transparent',
                    color: step === 'select' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                    fontSize: '0.875rem',
                    fontWeight: 600
                }}>
                    1. Select
                </div>
                <ChevronRight size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: step === 'upload' ? 'hsl(var(--primary))' : 'transparent',
                    color: step === 'upload' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    opacity: step === 'select' ? 0.5 : 1
                }}>
                    2. Upload
                </div>
                <ChevronRight size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: step === 'preview' ? 'hsl(var(--primary))' : 'transparent',
                    color: step === 'preview' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    opacity: step === 'select' || step === 'upload' ? 0.5 : 1
                }}>
                    3. Preview & Confirm
                </div>
            </div>

            {/* Step 1: Select Contractor and Floor */}
            {step === 'select' && (
                <div className="card glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                        Select Contractor and Floor Assignment
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Contractor Selection */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                marginBottom: '0.75rem',
                                color: 'hsl(var(--foreground))'
                            }}>
                                <Building2 size={16} />
                                Contractor *
                            </label>
                            <select
                                value={selectedContractor}
                                onChange={(e) => setSelectedContractor(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid hsl(var(--border))',
                                    background: 'hsl(var(--background))',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="">Select a contractor...</option>
                                {contractors.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.company_worker_code && `(${c.company_worker_code})`}
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                                All imported workers will be assigned to this contractor
                            </p>
                        </div>

                        {/* Floor Selection */}
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                marginBottom: '0.75rem',
                                color: 'hsl(var(--foreground))'
                            }}>
                                <Layers size={16} />
                                Floor Assignment *
                            </label>
                            <select
                                value={selectedFloor}
                                onChange={(e) => setSelectedFloor(e.target.value)}
                                disabled={!selectedContractor || floors.length === 0}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid hsl(var(--border))',
                                    background: selectedFloor ? 'hsl(var(--muted))' : 'hsl(var(--background))',
                                    fontSize: '0.875rem',
                                    cursor: !selectedContractor ? 'not-allowed' : 'default',
                                    opacity: !selectedContractor ? 0.6 : 1
                                }}
                            >
                                {!selectedContractor ? (
                                    <option value="">Select a contractor first...</option>
                                ) : floors.length === 0 ? (
                                    <option value="">No floor assigned to this contractor</option>
                                ) : (
                                    floors.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.floor_code}) - {f.sections?.sites?.name || 'Unknown Site'}
                                        </option>
                                    ))
                                )}
                            </select>
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                                {selectedFloor
                                    ? '✓ Floor automatically assigned based on contractor'
                                    : 'Floor will be auto-selected when you choose a contractor'
                                }
                            </p>
                        </div>

                        {/* Info Box */}
                        {selectedContractor && selectedFloor && (
                            <div style={{
                                padding: '1rem',
                                background: 'hsla(142, 71%, 45%, 0.1)',
                                border: '1px solid hsla(142, 71%, 45%, 0.3)',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(142, 71%, 45%)' }}>
                                    ✓ Ready to proceed
                                </div>
                                <div style={{ color: 'hsl(var(--foreground))' }}>
                                    Workers will be imported to:<br />
                                    <strong>{selectedContractorData?.name}</strong> on <strong>{selectedFloorData?.name}</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
                        <button
                            onClick={() => setStep('upload')}
                            className="btn-primary"
                            disabled={!canProceedToUpload}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                borderRadius: '0.5rem',
                                opacity: canProceedToUpload ? 1 : 0.5,
                                cursor: canProceedToUpload ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Continue to Upload
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Upload CSV */}
            {step === 'upload' && (
                <div className="card glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Upload CSV File
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                            Upload a CSV file with worker data. Required columns: <strong>name</strong>, <strong>rfid_tag</strong>
                        </p>
                    </div>

                    {/* Selected Info */}
                    <div style={{
                        padding: '1rem',
                        background: 'hsl(var(--muted))',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Assignment:</div>
                        <div>Contractor: <strong>{selectedContractorData?.name}</strong></div>
                        <div>Floor: <strong>{selectedFloorData?.name}</strong></div>
                    </div>

                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        border: '2px dashed hsl(var(--border))',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        position: 'relative'
                    }}>
                        <div style={{ padding: '1rem', background: 'hsl(var(--muted))', borderRadius: '50%' }}>
                            <Upload size={32} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Drop CSV file here or click to browse
                            </h3>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>
                                Supported format: .csv
                            </p>
                        </div>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                    </div>

                    {/* CSV Format Example */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'hsl(var(--muted))', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>
                            CSV Format Example:
                        </div>
                        <code style={{ fontSize: '0.75rem', fontFamily: 'monospace', display: 'block', whiteSpace: 'pre' }}>
                            name,rfid_tag,worker_code,status{'\n'}
                            John Doe,RFID001,WKR001,active{'\n'}
                            Jane Smith,RFID002,WKR002,active
                        </code>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
                        <button
                            onClick={() => setStep('select')}
                            className="btn-secondary"
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                borderRadius: '0.5rem'
                            }}
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview and Confirm */}
            {step === 'preview' && file && (
                <div className="card glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Preview Import Data
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
                                Review the data before confirming the import
                            </p>
                        </div>
                        <button
                            onClick={() => { setFile(null); setParsedData([]); setStep('upload') }}
                            className="hover-item"
                            style={{
                                padding: '0.5rem',
                                background: 'hsl(var(--muted))',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: 'pointer'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* File Info */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'hsl(var(--muted))',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ padding: '0.5rem', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: '0.375rem' }}>
                            <FileUp size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{file.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                {parsedData.length} records • {validCount} valid • {parsedData.length - validCount} errors
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Will be assigned to:</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {selectedContractorData?.name} • {selectedFloorData?.name}
                            </div>
                        </div>
                    </div>

                    {/* Data Preview Table */}
                    <div style={{
                        overflowX: 'auto',
                        marginBottom: '1.5rem',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'hsl(var(--muted))', zIndex: 10 }}>
                                <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem', width: '40px' }}>Status</th>
                                    <th style={{ padding: '0.75rem' }}>Name</th>
                                    <th style={{ padding: '0.75rem' }}>RFID Tag</th>
                                    <th style={{ padding: '0.75rem' }}>Worker Code</th>
                                    <th style={{ padding: '0.75rem' }}>Issues</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.map((row, i) => (
                                    <tr key={i} style={{
                                        borderBottom: '1px solid hsl(var(--border))',
                                        background: row.valid ? 'transparent' : 'hsla(0, 84%, 60%, 0.05)'
                                    }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            {row.valid ? (
                                                <CheckCircle size={18} style={{ color: 'hsl(142, 71%, 45%)' }} />
                                            ) : (
                                                <AlertCircle size={18} style={{ color: 'hsl(0, 84%, 60%)' }} />
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{row.data.name}</td>
                                        <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{row.data.rfid_tag}</td>
                                        <td style={{ padding: '0.75rem' }}>{row.data.worker_code || '-'}</td>
                                        <td style={{ padding: '0.75rem', color: 'hsl(0, 84%, 60%)', fontSize: '0.75rem' }}>
                                            {row.errors.join(', ') || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Warning if errors exist */}
                    {parsedData.length - validCount > 0 && (
                        <div style={{
                            padding: '1rem',
                            background: 'hsla(25, 95%, 53%, 0.1)',
                            border: '1px solid hsla(25, 95%, 53%, 0.3)',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '0.75rem',
                            fontSize: '0.875rem'
                        }}>
                            <AlertCircle size={18} style={{ color: 'hsl(25, 95%, 53%)', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {parsedData.length - validCount} row(s) have errors
                                </div>
                                <div style={{ color: 'hsl(var(--foreground))' }}>
                                    Only valid rows will be imported. Please fix errors in your CSV and re-upload if needed.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
                        <button
                            onClick={() => { setFile(null); setParsedData([]); setStep('upload') }}
                            className="btn-secondary"
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                borderRadius: '0.5rem'
                            }}
                        >
                            <ArrowLeft size={16} />
                            Change File
                        </button>
                        <button
                            onClick={handleImport}
                            className="btn-primary"
                            disabled={!canConfirm || isImporting}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                borderRadius: '0.5rem',
                                opacity: canConfirm && !isImporting ? 1 : 0.5,
                                cursor: canConfirm && !isImporting ? 'pointer' : 'not-allowed'
                            }}
                        >
                            {isImporting ? 'Importing...' : `Confirm Import (${validCount} workers)`}
                            <CheckCircle size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && importResult && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem',
                    animation: 'fadeIn 0.2s ease-in-out'
                }}>
                    <div className="glass-panel" style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '2.5rem',
                        borderRadius: '1rem',
                        textAlign: 'center',
                        animation: 'slideUp 0.3s ease-out'
                    }}>
                        {/* Success Icon */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            background: 'linear-gradient(135deg, hsl(142, 71%, 45%), hsl(142, 71%, 55%))',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'scaleIn 0.4s ease-out 0.1s backwards'
                        }}>
                            <CheckCircle size={48} style={{ color: 'white' }} />
                        </div>

                        {/* Success Message */}
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem',
                            color: 'hsl(var(--foreground))'
                        }}>
                            Import Successful!
                        </h2>

                        <p style={{
                            fontSize: '1rem',
                            color: 'hsl(var(--muted-foreground))',
                            marginBottom: '1.5rem',
                            lineHeight: 1.6
                        }}>
                            Successfully imported <strong style={{ color: 'hsl(142, 71%, 45%)' }}>{importResult.count} workers</strong> to<br />
                            <strong>{importResult.contractor}</strong> on <strong>{importResult.floor}</strong>
                        </p>

                        {/* Details Box */}
                        <div style={{
                            padding: '1rem',
                            background: 'hsla(142, 71%, 45%, 0.1)',
                            border: '1px solid hsla(142, 71%, 45%, 0.3)',
                            borderRadius: '0.5rem',
                            marginBottom: '2rem',
                            fontSize: '0.875rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Workers Imported:</span>
                                <span style={{ fontWeight: 600 }}>{importResult.count}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Contractor:</span>
                                <span style={{ fontWeight: 600 }}>{importResult.contractor}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Floor:</span>
                                <span style={{ fontWeight: 600 }}>{importResult.floor}</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => {
                                setShowSuccessModal(false)
                                router.push('/workers')
                            }}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                borderRadius: '0.5rem'
                            }}
                        >
                            View Workers
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0);
                    }
                    to {
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    )
}
