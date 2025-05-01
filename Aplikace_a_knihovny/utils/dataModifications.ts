export function getGenderByType(gender: number, type: string | null): string {
    if (type === "dog" && gender === 1) {
        return "Pes";
    }else if (type === "dog" && gender === 0) {
        return "Fena";
    }else if (type === "cat" && gender === 1) {
        return "Kocour";
    } else if (type === "cat" && gender === 0) {
        return "Kočka";
    } else {
        return "N/A";
    }
}

export function getFoundDateString(date: string): string {
    const foundDate = new Date(date);

    let ageString = "Nalezen / umístěn " + foundDate.toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long', day: 'numeric' });

    return ageString
}

export function getAdoptionFeeString(fee: number): string {
    if (fee === 0) {
        return "Adopční poplatek: zdarma";
    } else {
        return "Adopční poplatek: " + fee + " Kč";
    }
}

export function getSizeString(type: string | null, size: string | null): string {
    if(type === "small"){
        return "Malý" + " (" + size + ")";
    }else if(type === "medium") {
        return "Střední" + " (" + size + ")";
    }else{
        return "Velký" + " (" + size + ")";
    }
}

export const formatPhoneNumber = (phone: string | number): string => {
    return phone.toString().replace(/(\d{3})(?=\d)/g, '$1 ');
};
