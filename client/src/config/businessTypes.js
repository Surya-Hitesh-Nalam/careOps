export const BUSINESS_TYPES = {
    CLINICAL: {
        id: "clinical",
        label: "Clinical & Medical",
        customerTerm: "Patient",
        serviceTerm: "Treatment",
        features: ["soap_notes", "insurance", "prescriptions"],
        defaultForms: [
            { title: "Medical History", fields: ["Allergies", "Current Medications", "Surgeries"] },
            { title: "Patient Intake", fields: ["Insurance Provider", "Policy Number", "Emergency Contact"] }
        ]
    },
    SALON: {
        id: "salon",
        label: "Salon & Spa",
        customerTerm: "Client",
        serviceTerm: "Service",
        features: ["gallery", "style_history"],
        defaultForms: [
            { title: "Style Preferences", fields: ["Hair Type", "Color History", "Allergies to Dye"] },
            { title: "Liability Waiver", fields: ["Consent to Treatment", "Date"] }
        ]
    },
    AUTO: {
        id: "auto",
        label: "Auto Repair",
        customerTerm: "Customer",
        serviceTerm: "Service",
        features: ["vehicle_info", "inspection_report"],
        defaultForms: [
            { title: "Vehicle Check-in", fields: ["VIN", "License Plate", "Odometer Reading", "Damage Marks"] }
        ]
    },
    FITNESS: {
        id: "fitness",
        label: "Fitness & Wellness",
        customerTerm: "Member",
        serviceTerm: "Class/Session",
        features: ["health_waiver", "goals"],
        defaultForms: [
            { title: "Health Waiver", fields: ["Medical Conditions", "Emergency Contact", "Goals"] }
        ]
    },
    GENERAL: {
        id: "general",
        label: "General Service",
        customerTerm: "Customer",
        serviceTerm: "Service",
        features: [],
        defaultForms: [
            { title: "Service Agreement", fields: ["Name", "Terms Acceptance"] }
        ]
    }
};

export const getBusinessType = (typeString) => {
    const normalized = typeString?.toUpperCase().split(" ")[0]; // "Dental Clinic" -> "DENTAL"

    if (normalized === "CLINIC" || normalized === "DENTAL" || normalized === "MEDICAL") return BUSINESS_TYPES.CLINICAL;
    if (normalized === "SALON" || normalized === "SPA" || normalized === "BARBER") return BUSINESS_TYPES.SALON;
    if (normalized === "AUTO" || normalized === "MECHANIC") return BUSINESS_TYPES.AUTO;
    if (normalized === "FITNESS" || normalized === "GYM" || normalized === "YOGA") return BUSINESS_TYPES.FITNESS;

    return BUSINESS_TYPES.GENERAL;
};
