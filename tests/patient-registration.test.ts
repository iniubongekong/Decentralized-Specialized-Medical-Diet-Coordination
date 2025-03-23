import { describe, it, expect, beforeEach } from "vitest"

// Simple mock state
let mockPatientCounter = 0
const mockPatients = new Map()

// Simple mock functions
const registerPatient = (condition, allergies, restrictions, sender) => {
  const patientId = mockPatientCounter
  mockPatients.set(patientId, {
    owner: sender,
    condition,
    allergies,
    restrictions,
    timestamp: 123456,
  })
  mockPatientCounter++
  return { ok: patientId }
}

const updatePatientDiet = (patientId, allergies, restrictions, sender) => {
  const patient = mockPatients.get(patientId)
  if (!patient) return { err: 1 }
  
  if (patient.owner !== sender) {
    return { err: 1 }
  }
  
  mockPatients.set(patientId, {
    ...patient,
    allergies,
    restrictions,
    timestamp: 123457,
  })
  return { ok: true }
}

const getPatient = (patientId) => mockPatients.get(patientId) || null
const getPatientCount = () => mockPatientCounter

// Simple tests
describe("Patient Registration Contract", () => {
  beforeEach(() => {
    mockPatientCounter = 0
    mockPatients.clear()
  })
  
  it("should register a patient", () => {
    const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const condition = "Celiac Disease"
    const allergies = ["Wheat", "Barley", "Rye"]
    const restrictions = ["Gluten-Free", "Low-FODMAP"]
    
    const result = registerPatient(condition, allergies, restrictions, sender)
    expect(result.ok).toBe(0)
    expect(mockPatients.size).toBe(1)
    
    const patientData = getPatient(0)
    expect(patientData.condition).toBe(condition)
    expect(patientData.allergies).toEqual(allergies)
    expect(patientData.restrictions).toEqual(restrictions)
  })
  
  it("should update patient diet", () => {
    const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    registerPatient("Diabetes", ["Sucrose"], ["Low-Carb"], sender)
    
    const newAllergies = ["Sucrose", "Lactose"]
    const newRestrictions = ["Low-Carb", "Low-Fat"]
    
    const result = updatePatientDiet(0, newAllergies, newRestrictions, sender)
    expect(result.ok).toBe(true)
    
    const patientData = getPatient(0)
    expect(patientData.allergies).toEqual(newAllergies)
    expect(patientData.restrictions).toEqual(newRestrictions)
  })
  
  it("should not allow unauthorized updates", () => {
    const owner = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    const other = "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    
    registerPatient("Diabetes", ["Sucrose"], ["Low-Carb"], owner)
    
    const result = updatePatientDiet(0, ["New"], ["New"], other)
    expect(result.err).toBe(1)
    
    // Data should remain unchanged
    const patientData = getPatient(0)
    expect(patientData.allergies).toEqual(["Sucrose"])
    expect(patientData.restrictions).toEqual(["Low-Carb"])
  })
  
  it("should track patient count", () => {
    const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    expect(getPatientCount()).toBe(0)
    
    registerPatient("Condition1", ["A1"], ["R1"], sender)
    registerPatient("Condition2", ["A2"], ["R2"], sender)
    
    expect(getPatientCount()).toBe(2)
  })
})

