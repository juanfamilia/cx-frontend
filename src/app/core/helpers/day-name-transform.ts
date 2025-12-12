export function transformDayName(days: string[]): string[] {
    const translations: { [key: string]: string } = {
        'Monday': 'Lunes',
        'Tuesday': 'Martes',
        'Wednesday': 'Miércoles',
        'Thursday': 'Jueves',
        'Friday': 'Viernes',
        'Saturday': 'Sábado',
        'Sunday': 'Domingo'
    };
    let transformedDays = days.map(day => translations[day] || day);
    
    return transformedDays;
}