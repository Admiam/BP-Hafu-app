// ------------------ EMAIL VALID ------------------
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateEmail = (email: string): string | null => {
    if (!email.trim()) return "Email je povinný";
    if (!isValidEmail(email)) return "Zadejte platnou emailovou adresu";
    return null;
};


// ------------------ NAME VALID ------------------
export const validateName = (name: string, fieldName: string = "Jméno"): string | null => {
    if (!name.trim()) return `${fieldName} je povinné`;
    if (name.length < 2) return `${fieldName} musí obsahovat alespoň 2 znaky`;
    if (!/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s-]+$/.test(name))
        return `${fieldName} může obsahovat pouze písmena, mezery a pomlčky`;
    return null;
};


// ------------------ PHONE VALID ------------------
export const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return null; // Phone can be optional

    // Allow for international format (+420123456789) or local format (123456789)
    const phoneRegex = /^(\+\d{1,3})?[0-9]{9,12}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, '')))
        return "Zadejte platné telefonní číslo";

    return null;
};


// ------------------ PASSWORD VALID ------------------
export const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) return 'strong';
    return 'medium';
};

export interface PasswordValidationResult {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
    const errors: string[] = [];

    if (!password) {
        errors.push("Heslo je povinné");
        return { isValid: false, strength: 'weak', errors };
    }

    if (password.length < 8)
        errors.push("Heslo musí mít alespoň 8 znaků");

    if (!/[A-Z]/.test(password))
        errors.push("Heslo musí obsahovat alespoň jedno velké písmeno");

    if (!/[a-z]/.test(password))
        errors.push("Heslo musí obsahovat alespoň jedno malé písmeno");

    if (!/[0-9]/.test(password))
        errors.push("Heslo musí obsahovat alespoň jednu číslici");

    if (!/[^A-Za-z0-9]/.test(password))
        errors.push("Heslo musí obsahovat alespoň jeden speciální znak");

    if (/\s/.test(password))
        errors.push("Heslo nesmí obsahovat mezery");

    const strength = calculatePasswordStrength(password);

    return {
        isValid: errors.length === 0,
        strength,
        errors
    };
};

export const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
    if (!confirmation) return "Potvrzení hesla je povinné";
    if (password !== confirmation) return "Hesla se neshodují";
    return null;
};


// ------------------ NUMERIC VALUE VALID ------------------
export const validateNumeric = (value: string, fieldName: string): string | null => {
    if (!value.trim()) return null; // Can be optional unless checked with validateRequired

    // Allow for decimal numbers with comma or dot
    const normalized = value.replace(',', '.');
    if (isNaN(parseFloat(normalized)))
        return `${fieldName} musí být číslo`;

    return null;
};

export const validateInRange = (value: string, min: number, max: number, fieldName: string): string | null => {
    if (!value.trim()) return null;

    const normalized = value.replace(',', '.');
    const numValue = parseFloat(normalized);

    if (isNaN(numValue)) return `${fieldName} musí být číslo`;
    if (numValue < min) return `${fieldName} musí být alespoň ${min}`;
    if (numValue > max) return `${fieldName} nesmí být více než ${max}`;

    return null;
};

export const validateNumber = (value: string | undefined, fieldName: string, min?: number, max?: number): string | null => {
    if (!value || value.trim() === '') {
        return null; // Optional field
    }
    const normalized = value.replace(',', '.');
    const numValue = parseFloat(normalized);
    if (isNaN(numValue)) {
        return `${fieldName} musí být číslo`;
    }

    if (min !== undefined && numValue < min) {
        return `${fieldName} musí být alespoň ${min}`;
    }

    if (max !== undefined && numValue > max) {
        return `${fieldName} nesmí být více než ${max}`;
    }

    return null;
};


// ------------------ DATE VALID ------------------
export const validateDate = (date: string): string | null => {
    if (!date.trim()) return null; // Can be optional

    // Check if it's in format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
        return "Datum musí být ve formátu YYYY-MM-DD";

    const d = new Date(date);
    if (isNaN(d.getTime()))
        return "Zadejte platné datum";

    return null;
};

export const validatePetDate = (day: string, month: string, year: string, fieldName: string): string | null => {
    if ((!day || day.trim() === '') && (!month || month.trim() === '') && (!year || year.trim() === '')) {
        return `${fieldName} je povinné pole`; // Date is optional
    }

    if (!month || month.trim() === '') {
        return `Měsíc pro ${fieldName} je povinný`;
    }

    if (!year || year.trim() === '') {
        return `Rok pro ${fieldName} je povinný`;
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const d = parseInt(day, 10) || 1;

    if (m < 1 || m > 12) {
        return `Měsíc pro ${fieldName} musí být mezi 1 a 12`;
    }
    const currentYear = new Date().getFullYear();

    if (y < currentYear - 20 || y > new Date().getFullYear()) {
        return `Rok pro ${fieldName} není platný`;
    }

    // Check if the date is valid
    const date = new Date(y, m - 1, d);
    if (date.getMonth() !== m - 1) {
        return `Datum pro ${fieldName} není platné`;
    }

    return null;
};

export const validateUserDate = (day: string, month: string, year: string): string | null => {
    if ((!day || day.trim() === '') && (!month || month.trim() === '') && (!year || year.trim() === '')) {
        return `Datum narození je povinné pole`; // Date is optional
    }

    if (!month || month.trim() === '') {
        return `Měsíc pro narození je povinný`;
    }

    if (!year || year.trim() === '') {
        return `Rok pro narození je povinný`;
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const d = parseInt(day, 10) || 1;


    if (m < 1 || m > 12) {
        return `Měsíc narození musí být mezi 1 a 12`;
    }
    const currentYear = new Date().getFullYear();

    if (y < currentYear - 120 || y > new Date().getFullYear()) {
        return `Rok narození není platný`;
    }

    // Check if the date is valid
    const date = new Date(y, m - 1, d);
    if (date.getMonth() !== m - 1) {
        return `Datum narození není platné`;
    }

    return null;
};

export const validateBirthDate = (birthDate: string, fieldName: string): string | null => {
    if (!birthDate) return `${fieldName} je povinné pole`; // Optional

    try {
        const date = new Date(birthDate);
        if (isNaN(date.getTime())) return "Neplatné datum narození";

        const now = new Date();
        const minDate = new Date();
        minDate.setFullYear(now.getFullYear() - 120); // Maximum age 120 years
        if (date > now) return "Datum narození nemůže být v budoucnosti";
        if (date < minDate) return "Zadejte platné datum narození";

        const eightYearsAgo = new Date();
        eightYearsAgo.setFullYear(now.getFullYear() - 8);

        if (date > eightYearsAgo)
            return "Musíte být starší 8 let pro registraci";

        return null;
    } catch (e) {
        return "Neplatné datum narození";
    }
};

export const validateUserBirthDate = (date: Date): string | null => {
    try {
        if (isNaN(date.getTime())) return "Neplatné datum narození";

        const now = new Date();
        const minDate = new Date();
        minDate.setFullYear(now.getFullYear() - 120); // Maximum age 120 years

        if (date > now) return "Datum narození nemůže být v budoucnosti";
        if (date < minDate) return "Zadejte platné datum narození";

        const eightYearsAgo = new Date();
        eightYearsAgo.setFullYear(now.getFullYear() - 8);

        if (date > eightYearsAgo)
            return "Musíte být starší 8 let pro registraci";

        return null;
    } catch (e) {
        return "Neplatné datum narození";
    }
};

export const validateFutureDate = (date: string): string | null => {
    const basicError = validateDate(date);
    if (basicError) return basicError;

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today)
        return "Datum musí být v budoucnosti";

    return null;
};

export const validatePastDate = (date: string): string | null => {
    const basicError = validateDate(date);
    if (basicError) return basicError;

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today)
        return "Datum musí být v minulosti";

    return null;
};


// ------------------ TEXT VALID ------------------
export const validateLength = (value: string, min: number, max: number, fieldName: string): string | null => {
    if (value.length < min)
        return `${fieldName} musí mít alespoň ${min} znaků`;

    if (value.length > max)
        return `${fieldName} nesmí mít více než ${max} znaků`;

    return null;
};

export const validateLengthImportant = (value: string, min: number, max: number, fieldName: string): string | null => {
    if (!value.trim()) return `${fieldName} je povinné pole`;

    if (value.length < min)
        return `${fieldName} musí mít alespoň ${min} znaků`;

    if (value.length > max)
        return `${fieldName} nesmí mít více než ${max} znaků`;

    return null;
};


// ------------------ URL VALID ------------------
export const validateUrl = (url: string): string | null => {
    if (!url.trim()) return null;

    try {
        new URL(url);
        return null;
    } catch (e) {
        return "Zadejte platnou URL adresu";
    }
};


// ------------------ OTHER VALID ------------------
export const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value || !value.trim()) return `${fieldName} je povinné pole`;
    return null;
};
export const validateRequiredArray = (value: string[], fieldName: string): string | null => {
    if (value.length === 0) return `${fieldName} je povinné pole`;
    return null;
};

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string | null>;
}

export const validateForm = (validations: Record<string, string | null>): ValidationResult => {
    const errors: Record<string, string | null> = { ...validations };
    const isValid = Object.values(validations).every(error => error === null);

    return { isValid, errors };
};

export const validateImages = (images: any[], min: number = 0): string | null => {
    if (images.length < min) {
        return `Nahrajte prosím alespoň ${min} ${min === 1 ? 'fotografii' : min < 5 ? 'fotografie' : 'fotografií'}`;
    }
    return null;
};

// ------------------ PET VALIDATION ------------------
export const validatePetName = (name: string | undefined): string | null => {
    if (!name || name.trim() === '') {
        return 'Jméno mazlíka je povinné';
    }
    if (name.trim().length < 2) {
        return 'Jméno mazlíka musí obsahovat alespoň 2 znaky';
    }
    return null;
};

export const validatePetRegistration = (values: any): Record<string, string | null> => {
    const errors: Record<string, string | null> = {};

    errors.petName = validatePetName(values.petName);
    // errors.selectedTypeValue = validateRequired(values.selectedTypeValue, 'Typ mazlíka');
    if (values.selectedSize){
        if (!values.type || values.type === 'dog') {
            errors.selectedSize = validateRequired(values.selectedSize, 'Velikost');
        }
    }
    errors.birthDate = validatePetDate('1', values.month, values.year, 'datum narození');
    errors.foundDate = validatePetDate(values.foundDay, values.foundMonth, values.foundYear, 'datum nalezení');
    errors.weight = validateNumber(values.weight?.toString(), 'Váha', 0);
    errors.fee = validateNumber(values.fee?.toString(), 'Adopční poplatek', 0);

    if (values.selectedBreed){
        if (values.crossbreed){
            errors.breeds = validateRequiredArray(values.selectedBreed, 'Plemeno');
        }else {
            errors.breeds = validateRequired(values.selectedBreed, 'Plemeno');
        }
    }

    if (values.handicap === 'true') {
        errors.handicapText = validateLengthImportant(values.handicapText, 0, 500, 'Popis handicapu');
    }

    errors.petText = validateLength(values.petText, 0, 500, 'Popis mazlíka');
    errors.images = validateImages(values.uploadedImages, 1);

    // Filter out null errors
    return Object.fromEntries(
        Object.entries(errors).filter(([_, value]) => value !== null)
    );
};

export const validateShelterRegistration = (values: any): Record<string, string | null> => {
    const errors: Record<string, string | null> = {};

    // Basic required fields
    errors.shelterName = validateRequired(values.shelterName, 'Název útulku');
    // errors.registrationId = validateRequired(values.registrationId, 'Registrační číslo');

    // Address validation
    errors.street = validateRequired(values.street, 'Ulice a číslo popisné');
    errors.city = validateRequired(values.city, 'Město');
    errors.postalCode = validateRequired(values.postalCode, 'PSČ');
    errors.postalCode = validateNumber(values.postalCode, 'PSČ', 0);
    errors.region = validateRequired(values.region, 'Kraj');
    // errors.country = validateRequired(values.country, 'Země');

    // Contact information
    errors.phone = validatePhone(values.phone);
    if (!errors.phone && values.phone.trim()) {
        // Additional check to ensure phone is required
        errors.phone = validateRequired(values.phone, 'Telefonní číslo');
    }

    // Numeric fields
    errors.founded = validateNumber(values.founded, 'Rok vzniku', 1800, new Date().getFullYear());
    if (!errors.founded) {
        errors.founded = validateRequired(values.founded, 'Rok vzniku');
    }

    errors.petCount = validateNumber(values.petCount, 'Aktuální počet mazlíků', 0);

    errors.numPetsAdopted = validateNumber(values.numPetsAdopted, 'Počet adopcí za rok', 0);

    // Description validation
    errors.bio = validateLengthImportant(values.bio, 0, 500, 'Popis útulku');

    // Image validation
    errors.images = validateImages(values.uploadedImages, 1);

    // Filter out null errors
    return Object.fromEntries(
        Object.entries(errors).filter(([_, value]) => value !== null)
    );
};

export const validateAccountForm = (values: any, isUpdate: boolean = false): Record<string, string | null> => {
    const errors: Record<string, string | null> = {};

    // Name validation
    errors.firstName = validateName(values.firstName, "Jméno");
    errors.lastName = validateName(values.lastName, "Příjmení");

    // Email validation
    errors.email = validateEmail(values.email);

    // Password validation for registration or password change
    if (!isUpdate || values.newPassword) {
        if (!isUpdate) {
            // For registration, password is required
            const passwordResult = validatePassword(values.password);
            errors.password = passwordResult.errors.length > 0
                ? passwordResult.errors[0]
                : null;

            // Confirm password
            errors.confirmPassword = validatePasswordConfirmation(
                values.password,
                values.confirmPassword
            );
        } else if (values.newPassword) {
            // For password change during update
            if (!values.oldPassword) {
                errors.oldPassword = "Současné heslo je povinné pro změnu hesla";
            }
            if (!values.oldPasswordTwo) {
                errors.oldPasswordTwo = "Současné heslo je povinné pro změnu hesla";
            }

            const passwordResult = validatePassword(values.newPassword);
            errors.newPassword = passwordResult.errors.length > 0
                ? passwordResult.errors[0]
                : null;

            errors.confirmPassword = validatePasswordConfirmation(
                values.newPassword,
                values.confirmPassword
            );
        }
    }

    // Birth date validation (if provided)
    if (values.birthDate) {
        errors.birthDate = validateBirthDate(values.birthDate, "Datum narození");
    }

    // Phone validation (if provided)
    if (values.phone) {
        errors.phone = validatePhone(values.phone);
    }

    // Filter out null errors
    return Object.fromEntries(
        Object.entries(errors).filter(([_, value]) => value !== null)
    );
};