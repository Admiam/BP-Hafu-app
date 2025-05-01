import {format} from "date-fns";

export function getDateString(date: string): string {

    const birthDate = new Date(date);
    const currentDate = new Date();

    const monthDiff = (currentDate.getFullYear() - birthDate.getFullYear()) * 12 +
        (currentDate.getMonth() - birthDate.getMonth());
    const years = Math.floor(monthDiff / 12);
    const months = monthDiff % 12;

    let ageString = '';

    if (monthDiff < 1) {
        ageString = 'méně jak 1 měsíc';
    } else if (monthDiff < 12) {
        if (monthDiff === 1) {
            ageString = '1 měsíc';
        } else if (monthDiff >= 2 && monthDiff <= 4) {
            ageString = `${monthDiff} měsíce`;
        } else {
            ageString = `${monthDiff} měsíců`;
        }
    } else if (years === 1 && months === 0) {
        ageString = '1 rok';
    } else {
        // Format with decimal places if there are remaining months
        if (months === 0) {
            // Czech grammar rules for years
            if (years === 1) {
                ageString = '1 rok';
            } else if (years >= 2 && years <= 4) {
                ageString = `${years} roky`;
            } else {
                ageString = `${years} let`;
            }
        } else {
            // Show years with decimal (1,5 let)
            const decimalYears = years + (months / 12);
            ageString = `${decimalYears.toFixed(1).replace('.', ',')} let`;
        }
    }
    return ageString
}

export function getShortDateString(date: string): string {

    const birthDate = new Date(date);
    const currentDate = new Date();

    const monthDiff = (currentDate.getFullYear() - birthDate.getFullYear()) * 12 +
        (currentDate.getMonth() - birthDate.getMonth());
    const years = Math.floor(monthDiff / 12);
    const months = monthDiff % 12;

    let ageString = '';

    if (monthDiff < 1) {
        ageString = '<1 měsíc';
    } else if (monthDiff < 12) {
        if (monthDiff === 1) {
            ageString = '1 měsíc';
        } else if (monthDiff >= 2 && monthDiff <= 4) {
            ageString = `${monthDiff} měsíce`;
        } else {
            ageString = `${monthDiff} měsíců`;
        }
    } else if (years === 1 && months === 0) {
        ageString = '1 rok';
    } else {
        // Format with decimal places if there are remaining months
        if (months === 0) {
            // Czech grammar rules for years
            if (years === 1) {
                ageString = '1 rok';
            } else if (years >= 2 && years <= 4) {
                ageString = `${years} roky`;
            } else {
                ageString = `${years} let`;
            }
        } else {
            // Show years with decimal (1,5 let)
            const decimalYears = years + (months / 12);
            ageString = `${decimalYears.toFixed(1).replace('.', ',')} let`;
        }
    }
    return ageString
}

export const extractDateParts = (isoDate: string) => {
    const date = new Date(isoDate);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1);
    const year = String(date.getFullYear());

    return { day, month, year };
};

export const dateParser = (day: string, month: string, year: string) => {
    const d = parseInt(day, 10) || 1;
    const m = parseInt(month, 10) - 1 || 1; // zero-based
    const y = parseInt(year, 10) || 2000;

    const constructed = new Date(y, m, d);

    return format(constructed, "yyyy-MM-dd")
}

export const getYearOptions = (): { label: string; value: string }[] => {
    const currentYear = new Date().getFullYear();
    const years: { label: string; value: string }[] = [];

    for (let y = currentYear; y >= currentYear - 20; y--) {
        years.push({ label: String(y), value: String(y) });
    }

    return years;
}

export const calculateMonthsFromBirthdate = ( birth: string) => {
    const currentDate = new Date();
    const birthDateObj = new Date(birth);

    let months = (currentDate.getFullYear() - birthDateObj.getFullYear()) * 12;
    months -= birthDateObj.getMonth();
    months += currentDate.getMonth();

    // Adjust for day of the month
    if (currentDate.getDate() < birthDateObj.getDate()) {
        months--;
    }

    return months;
}
